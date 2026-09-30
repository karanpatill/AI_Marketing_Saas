import os

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update OnboardingData to hold the new colors object
type_orig = """  primaryColor: string;
  accentColor: string;"""
type_new = """  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };"""
content = content.replace(type_orig, type_new)

# 2. Update INITIAL_DATA
init_orig = """  primaryColor: "#0D0D0D", accentColor: "#C9A84C","""
init_new = """  colors: { primary: "#0D0D0D", secondary: "#1C1C1C", accent: "#C9A84C", background: "#FFFFFF", text: "#000000" },"""
content = content.replace(init_orig, init_new)

# 3. Update the handleSend where we parse the scraped data
handle_send_orig = """        const newData = {
          ...data,
          brandName: scraped?.brandName || userText.split(".")[0],
          website: userText,
          industry: scraped?.industry || "Technology",
          businessDescription: scraped?.businessDescription || "A modern brand.",
          mission: scraped?.mission || "To deliver excellence.",
          targetAudience: scraped?.targetAudience || "General consumers",
        };"""
handle_send_new = """        const newData = {
          ...data,
          brandName: scraped?.brandName || userText.split(".")[0],
          website: userText,
          industry: scraped?.industry || "Technology",
          businessDescription: scraped?.businessDescription || "A modern brand.",
          mission: scraped?.mission || "To deliver excellence.",
          targetAudience: scraped?.targetAudience || "General consumers",
          colors: scraped?.colors || data.colors,
        };"""
content = content.replace(handle_send_orig, handle_send_new)

# 4. Update handleSelectMoodboard logic - now we just approve the extracted colors
select_mood_orig = """  const handleSelectMoodboard = (key: string, mood: any) => {
    setData(prev => ({ ...prev, approvedMoodboard: { id: key, name: mood.name, tagline: mood.tagline, imageUrl: null } }));
    addMessage("user", "text", `I select ${mood.name}.`);
    setStep("complete");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "text", "Perfect. Your autonomous marketing engine is ready to deploy. Click below to initialize your workspace.");
    }, 1000);
  };"""
select_mood_new = """  const handleApprovePalette = () => {
    addMessage("user", "text", "Visual direction approved.");
    setStep("complete");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "text", "Perfect. Your autonomous marketing engine is ready to deploy. Click below to initialize your workspace.");
    }, 1000);
  };"""
content = content.replace(select_mood_orig, select_mood_new)

# 5. Update the UI for moodboard_picker
ui_mood_orig = """                {msg.type === "moodboard_picker" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 w-[600px] max-w-full">
                    {Object.entries(MOODBOARD_PRESETS).map(([key, mood]) => (
                      <div key={key} onClick={() => step === "moodboard" && handleSelectMoodboard(key, mood)} className={`p-4 rounded-xl border transition-all ${step === "moodboard" ? 'cursor-pointer hover:border-brand-secondary border-[#2A2A2A] bg-[#101010]' : 'border-[#2A2A2A] bg-[#101010] opacity-50'}`}>
                        <div className="flex gap-1 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ background: mood.colors[0] }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ background: mood.colors[1] }}></div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{mood.name}</h4>
                        <p className="text-[10px] text-gray-500">{mood.tagline}</p>
                      </div>
                    ))}
                  </div>
                )}"""
ui_mood_new = """                {msg.type === "moodboard_picker" && (
                  <div className="bg-[#101010] border border-[#2A2A2A] p-6 rounded-2xl mt-2 w-full max-w-[500px] shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Website Colors Extracted</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {[
                        { label: "Primary", hex: data.colors.primary, key: "primary" },
                        { label: "Secondary", hex: data.colors.secondary, key: "secondary" },
                        { label: "Accent", hex: data.colors.accent, key: "accent" },
                        { label: "Bg", hex: data.colors.background, key: "background" },
                        { label: "Text", hex: data.colors.text, key: "text" }
                      ].map(color => (
                        <div key={color.key} className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full border border-[#2A2A2A] shadow-inner" style={{ background: color.hex }}></div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase">{color.label}</span>
                          <input type="text" value={color.hex || '#000000'} onChange={(e) => setData({...data, colors: {...data.colors, [color.key]: e.target.value}})} className="w-full bg-transparent border-b border-[#2A2A2A] text-center text-[10px] text-white outline-none focus:border-brand-secondary" />
                        </div>
                      ))}
                    </div>
                    {step === "moodboard" && (
                      <button onClick={handleApprovePalette} className="w-full py-3 bg-[#E1E0CC] hover:bg-white text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        Approve Visual Direction <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}"""
content = content.replace(ui_mood_orig, ui_mood_new)

# 6. Update handleSubmitAll to save the new colors to logo_studio_data
submit_orig = """      await supabase.from("brand_assets").insert({
        brand_dna_id: dnaResult.id,
        logo_url: data.logoUrl || "",
        logo_studio_data: { uploadUrl: data.logoUrl || "", colors: { primaryHex: data.primaryColor, secondaryHex: data.accentColor } }
      });"""
submit_new = """      await supabase.from("brand_assets").insert({
        brand_dna_id: dnaResult.id,
        logo_url: data.logoUrl || "",
        logo_studio_data: { uploadUrl: data.logoUrl || "", colors: data.colors }
      });"""
content = content.replace(submit_orig, submit_new)

# 7. Update chat ai wording
word_orig = "Got it. Finally, choose a visual direction for your AI-generated posts."
word_new = "Got it. Finally, I've extracted your brand's exact color palette from your website. Verify it below."
content = content.replace(word_orig, word_new)

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated ChatOnboarding.tsx')
