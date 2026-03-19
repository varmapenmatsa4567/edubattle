"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Download,
  Eye,
  Clock,
  User,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

export default function TeacherResultsPage() {
  const { loading } = useRequireRole(ROLES.TEACHER);
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  const dummyResults = [
    { id: 1, student: "Sarah Johnson", quiz: "Algebra Basics", score: 92, accuracy: "95%", time: "18m", date: "12/03/2026" },
    { id: 2, student: "Michael Chen", quiz: "Algebra Basics", score: 85, accuracy: "88%", time: "22m", date: "12/03/2026" },
    { id: 3, student: "Emma Davis", quiz: "Plant Anatomy", score: 78, accuracy: "82%", time: "15m", date: "10/03/2026" },
    { id: 4, student: "James Wilson", quiz: "Plant Anatomy", score: 95, accuracy: "98%", time: "20m", date: "10/03/2026" },
    { id: 5, student: "Olivia Martinez", quiz: "Tenses & Grammar", score: 64, accuracy: "70%", time: "30m", date: "08/03/2026" },
  ];

  return (
    <div className="w-full h-full pb-20 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Assessment Results 📊
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Monitor student performance across all assessments and quizzes
          </p>
        </div>
        <Button variant="outline" className="border-slate-200 gap-2 h-11 px-6 font-semibold rounded-lg">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* SEARCH */}
      <InputGroup className="max-w-md h-12 bg-white dark:bg-zinc-950 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-all focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:border-purple-400 px-2">
        <InputGroupAddon align="inline-start" className="bg-transparent border-none pl-3 pr-1">
          <Search className="h-5 w-5 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput 
          placeholder="Search results..." 
          className="h-full border-none bg-transparent focus-visible:ring-0 rounded-none text-base pl-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="bg-transparent border-none text-sm font-medium text-muted-foreground pr-4">
          {dummyResults.length} results
        </InputGroupAddon>
      </InputGroup>

      {/* RESULTS TABLE */}
      <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/50 h-12">
            <TableRow className="uppercase text-[11px] font-bold tracking-wider text-muted-foreground border-b-slate-100 dark:border-zinc-800">
              <TableHead className="px-6">Student</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Time Taken</TableHead>
              <TableHead className="px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyResults.map((res) => (
              <TableRow key={res.id} className="hover:bg-slate-50 transition-colors border-b-slate-100 dark:border-zinc-800 h-16">
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarFallback className="bg-purple-600 text-white font-bold text-[10px]">
                        {res.student.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{res.student}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {res.quiz}
                </TableCell>
                <TableCell className="font-bold text-sm">
                  <span className={res.score > 80 ? 'text-emerald-600' : res.score > 70 ? 'text-purple-600' : 'text-orange-600'}>
                    {res.score}/100
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] uppercase">
                    {res.accuracy}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-medium text-muted-foreground">
                  {res.time}
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-purple-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
