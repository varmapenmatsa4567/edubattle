"use client";

import React from "react";
import { Plus, Brain, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CreateQuizButtonProps {
  className?: string;
  label?: string;
  classId?: string;
}

export function CreateQuizButton({ className, label = "Create Quiz", classId }: CreateQuizButtonProps) {
  const router = useRouter();

  const handleCreate = (mode: "AI" | "Manual") => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (classId) {
      params.set("class_id", classId);
    }
    router.push(`/teacher/quizzes/create?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold transition-all shadow-md h-11 px-6 rounded-xl", className)}>
          <Plus className="h-5 w-5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 bg-white dark:bg-zinc-950">
        <DropdownMenuItem 
          onClick={() => handleCreate("Manual")}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-colors focus:bg-purple-50 dark:focus:bg-purple-900/20"
        >
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
            <FileEdit className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">Manual Quiz</span>
            <span className="text-[10px] text-muted-foreground font-medium">Create questions manually</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleCreate("AI")}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-colors focus:bg-purple-50 dark:focus:bg-purple-900/20 mt-1"
        >
          <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
            <Brain className="h-4 w-4 text-purple-600 group-hover:text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">AI Quiz</span>
            <span className="text-[10px] text-muted-foreground font-medium">Generate with AI power</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
