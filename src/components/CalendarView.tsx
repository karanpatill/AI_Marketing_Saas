"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore } from "date-fns";

interface CalendarItem {
  id: string;
  date: string;
  post_type: "static" | "carousel" | "video";
  title: string;
  concept_brief: string;
  cta: string;
  status: string;
}

interface CalendarViewProps {
  items: CalendarItem[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarView({ items, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Determine color based on post type
  const getPostColor = (type: string) => {
    switch (type) {
      case "carousel": return "bg-white border-white text-black";
      case "static": return "bg-[#DEDBC8] border-[#DEDBC8] text-black";
      case "video": return "bg-[#828282] border-[#828282] text-white";
      default: return "bg-transparent border-[#828282]/20";
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif-italic text-[#E1E0CC]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-[#1c1e21] rounded-full hover:bg-[#2a2c30] transition-colors border border-[#828282]/20">
            <ChevronLeft className="w-4 h-4 text-[#828282]" />
          </button>
          <button onClick={nextMonth} className="p-2 bg-[#1c1e21] rounded-full hover:bg-[#2a2c30] transition-colors border border-[#828282]/20">
            <ChevronRight className="w-4 h-4 text-[#828282]" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-[11px] uppercase tracking-wider text-[#828282] pb-2">
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        const dateString = format(day, "yyyy-MM-dd");
        const dayItems = items.filter(item => item.date === dateString);
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            onClick={() => onSelectDate(cloneDay)}
            className={`
              relative min-h-[90px] p-2 border border-[#828282]/10 transition-all cursor-pointer
              ${!isCurrentMonth ? "bg-[#141517]/50 text-[#828282]/30" : "bg-[#1c1e21] hover:bg-[#2a2c30] text-[#E1E0CC]"}
              ${isSelected ? "ring-2 ring-[#DEDBC8] bg-[#2a2c30]" : ""}
              ${isPast ? "opacity-60" : ""}
            `}
          >
            <span className={`text-xs font-medium ${isSelected ? "text-white" : ""}`}>
              {formattedDate}
            </span>
            
            <div className="absolute top-7 left-2 right-2 flex flex-col gap-1">
              {dayItems.slice(0, 3).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`text-[9px] truncate px-1.5 py-0.5 rounded-[4px] font-semibold border ${getPostColor(item.post_type)}`}
                  title={item.title}
                >
                  {item.post_type === "carousel" ? "C" : item.post_type === "video" ? "V" : "P"} : {item.title}
                </div>
              ))}
              {dayItems.length > 3 && (
                <div className="text-[9px] text-[#828282] text-center">+{dayItems.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-[#828282]/20 rounded-xl overflow-hidden shadow-xl bg-[#0a0a0a]">{rows}</div>;
  };

  return (
    <div className="w-full">
      {renderHeader()}
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center mb-6 px-4 py-3 bg-[#1c1e21] rounded-xl border border-[#828282]/20 shadow-sm">
        <span className="text-[11px] text-[#828282] uppercase tracking-widest font-bold mr-2">Color Guide:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white"></div>
          <span className="text-xs text-[#E1E0CC]">Carousel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#DEDBC8]"></div>
          <span className="text-xs text-[#E1E0CC]">Post (Static)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#828282]"></div>
          <span className="text-xs text-[#E1E0CC]">Video</span>
        </div>
      </div>

      {renderDays()}
      {renderCells()}
    </div>
  );
}
