"use client";

import React, { useState } from "react";
import { 
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  Eye,
  GraduationCap,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const DUMMY_STUDENTS = [
  { id: 1, name: "Sarah Johnson", grade: "Grade 10-A", username: "sarah.johnson", status: "Active", joined: "Jan 15, 2025", avatar: "https://i.pravatar.cc/150?u=sarah", initials: "SJ", color: "bg-blue-500" },
  { id: 2, name: "Michael Chen", grade: "Grade 9-A", username: "michael.chen", status: "Active", joined: "Jan 10, 2025", avatar: "https://i.pravatar.cc/150?u=michael", initials: "MC", color: "bg-red-500" },
  { id: 3, name: "Emma Davis", grade: "Grade 10-B", username: "emma.davis", status: "Active", joined: "Jan 8, 2025", avatar: "https://i.pravatar.cc/150?u=emma", initials: "ED", color: "bg-emerald-500" },
  { id: 4, name: "James Wilson", grade: "Grade 11-A", username: "james.wilson", status: "Active", joined: "Dec 28, 2024", avatar: "https://i.pravatar.cc/150?u=james", initials: "JW", color: "bg-orange-500" },
  { id: 5, name: "Olivia Martinez", grade: "Grade 9-B", username: "olivia.martinez", status: "Active", joined: "Dec 20, 2024", avatar: "https://i.pravatar.cc/150?u=olivia", initials: "OM", color: "bg-purple-500" },
  { id: 6, name: "Liam Brown", grade: "Grade 10-A", username: "liam.brown", status: "Inactive", joined: "Dec 15, 2024", avatar: "https://i.pravatar.cc/150?u=liam", initials: "LB", color: "bg-rose-500" },
  { id: 7, name: "Sophia Taylor", grade: "Grade 11-B", username: "sophia.taylor", status: "Active", joined: "Dec 10, 2024", avatar: "https://i.pravatar.cc/150?u=sophia", initials: "ST", color: "bg-yellow-500" },
  { id: 8, name: "Noah Anderson", grade: "Grade 12-A", username: "noah.anderson", status: "Active", joined: "Dec 5, 2024", avatar: "https://i.pravatar.cc/150?u=noah", initials: "NA", color: "bg-teal-500" },
];

export default function StudentsPage() {
  const [isPasswordGenerated, setIsPasswordGenerated] = useState("qrwpgo3nNMPX");

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pswd = "";
    for (let i = 0; i < 12; i++) {
      pswd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setIsPasswordGenerated(pswd);
  };

  return (
    <div className="w-full h-full pb-20 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Students</h2>
            <span className="text-3xl">👨‍🎓</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all students in your school
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Student</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the details to create a new student account
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Full Name</label>
                <Input placeholder="Enter student's full name" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Class / Grade</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade10a">Grade 10-A</SelectItem>
                    <SelectItem value="grade10b">Grade 10-B</SelectItem>
                    <SelectItem value="grade9a">Grade 9-A</SelectItem>
                    <SelectItem value="grade11a">Grade 11-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Username</label>
                <Input placeholder="student.username" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Password (Auto-generated)</label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={isPasswordGenerated} className="bg-muted/30" />
                  <Button variant="outline" size="icon" className="shrink-0" title="Copy password">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button onClick={generatePassword} variant="outline" size="icon" className="shrink-0" title="Rotate password">
                    <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Make sure to save this password - it won't be shown again</p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                Create Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* OPTIONAL STATS - TOP SECTION */}
      <div className="grid gap-6 md:grid-cols-3 mb-4">
        <Card className="rounded-xl shadow-sm border-muted/50">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-sm font-medium">+8%</span>
            </div>
            <div className="text-3xl font-bold">1,200</div>
            <p className="text-sm font-medium text-muted-foreground mt-1">Total Students</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-muted/50">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-sm font-medium">92%</span>
            </div>
            <div className="text-3xl font-bold">1,104</div>
            <p className="text-sm font-medium text-muted-foreground mt-1">Active Students</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-muted/50">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-sm font-medium">+24</span>
            </div>
            <div className="text-3xl font-bold">96</div>
            <p className="text-sm font-medium text-muted-foreground mt-1">New This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-9 bg-white dark:bg-zinc-950 border-muted rounded-xl w-full h-10"
          />
        </div>
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-950 border-muted rounded-xl h-10">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="grade10">Grade 10</SelectItem>
              <SelectItem value="grade9">Grade 9</SelectItem>
              <SelectItem value="grade11">Grade 11</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-950 border-muted rounded-xl h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20 text-xs text-muted-foreground font-semibold">
            <TableRow className="hover:bg-transparent tracking-wider border-b-muted/40">
              <TableHead className="px-6 py-4 uppercase">Student</TableHead>
              <TableHead className="py-4 uppercase">Class / Grade</TableHead>
              <TableHead className="py-4 uppercase">Username</TableHead>
              <TableHead className="py-4 uppercase">Status</TableHead>
              <TableHead className="py-4 uppercase">Joined Date</TableHead>
              <TableHead className="px-6 py-4 text-right uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_STUDENTS.length > 0 ? (
              DUMMY_STUDENTS.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-default transition-colors border-b-muted/40 h-16">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-muted/30">
                        <AvatarFallback className={`${student.color} text-white text-xs font-semibold`}>
                          {student.initials}
                        </AvatarFallback>
                        <AvatarImage src={student.avatar} alt={student.name} />
                      </Avatar>
                      <span className="font-semibold text-sm text-foreground">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">{student.grade}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground font-medium">{student.username}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`font-medium text-xs rounded-full border-0 px-2.5 py-0.5 ${
                        student.status === "Active" 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">{student.joined}</TableCell>
                  <TableCell className="px-6 text-right align-middle">
                    {/* The icons should naturally appear, but be subtle. Added opacity logic mostly. */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
                    <p>No students found</p>
                    <Button variant="link" className="text-purple-600 mt-2">Add your first student</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-slate-50/30 dark:bg-transparent">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1</span> to <span className="font-semibold text-foreground">8</span> of <span className="font-semibold text-foreground">8</span> students
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" className="h-8 w-8 rounded-lg shadow-sm bg-purple-600 hover:bg-purple-700 text-white p-0">
              1
            </Button>
            <Button variant="outline" className="h-8 w-8 rounded-lg shadow-sm p-0 bg-white dark:bg-zinc-950">
              2
            </Button>
            <Button variant="outline" className="h-8 w-8 rounded-lg shadow-sm p-0 bg-white dark:bg-zinc-950">
              3
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}