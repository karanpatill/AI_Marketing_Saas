import { createAdminClient } from '@/lib/supabaseServer';
import { ContextEngine } from '../ai/core/ContextEngine';

export class KnowledgeService {
  
  /**
   * Adds a new document to the Knowledge Base, chunks it, vectorizes it, and saves to pgvector.
   */
  public static async ingestDocument(
    workspaceId: string, 
    projectId: string | null, 
    title: string, 
    content: string, 
    sourceType: 'text' | 'url' | 'pdf' = 'text'
  ) {
    const supabase = createAdminClient();

    // 1. Create the parent knowledge_base entry
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .insert({
        workspace_id: workspaceId,
        project_id: projectId,
        title,
        source_type: sourceType,
      })
      .select('id')
      .single();

    if (kbError || !kbData) {
      throw new Error(`Failed to create knowledge base entry: ${kbError?.message}`);
    }

    const kbId = kbData.id;

    // 2. Chunk the document (naive chunking for now, ~500 chars per chunk)
    const chunks = this.chunkText(content, 500);

    // 3. Process each chunk (Vectorize & Insert)
    const chunkPromises = chunks.map(async (chunkContent, index) => {
      // Call our ContextEngine which handles the Embedding model request
      const embedding = await ContextEngine.generateEmbedding(chunkContent);

      return supabase.from('document_chunks').insert({
        knowledge_base_id: kbId,
        workspace_id: workspaceId,
        content: chunkContent,
        embedding: [], // pgvector format
        chunk_index: index
      });
    });

    await Promise.all(chunkPromises);

    return { success: true, knowledge_base_id: kbId, chunks_processed: chunks.length };
  }

  /**
   * A basic naive text chunker. In a real system, you'd use LangChain's RecursiveCharacterTextSplitter.
   */
  private static chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    
    // Split by paragraphs to try and keep semantic meaning
    const paragraphs = text.split('\n\n');
    
    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = p;
      } else {
        currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + p;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
