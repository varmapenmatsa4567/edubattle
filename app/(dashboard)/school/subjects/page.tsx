"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Loader2,
  BookOpen,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getSchoolDetails } from "@/services/schoolService";
import { getSubjects, addSubject } from "@/services/subjectService";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SubjectsPage() {
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const [school, setSchool] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getSchoolDetails(user.id).then(setSchool);
    }
  }, [user]);

  const fetchSubjects = async () => {
    if (school?.id) {
      setLoadingSubjects(true);
      const data = await getSubjects(school.id);
      if (data) {
        setSubjects(data);
      }
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [school]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !school?.id) return;

    // Check for uniqueness
    const isDuplicate = subjects.some(
      (s) => s.subject_name.toLowerCase() === newSubjectName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This subject already exists.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addSubject(school.id, newSubjectName.trim());
      if (result) {
        toast.success("Subject added successfully!");
        setNewSubjectName("");
        setIsDialogOpen(false);
        fetchSubjects(); // Refresh list
      } else {
        toast.error("Failed to add subject.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-muted/50 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your school's curriculum and subjects
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg flex items-center gap-2 h-11 px-6">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Subject</DialogTitle>
              <CardDescription>
                Enter the name of the subject to add it to your school's list.
              </CardDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Subject Name</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Mathematics" 
                    className="pl-9 h-11 rounded-lg" 
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSubject} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!newSubjectName.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search subjects..." 
          className="pl-9 h-11 rounded-xl bg-white dark:bg-zinc-950 border-muted/60" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loadingSubjects ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 min-h-[300px]">
          <Spinner />
          <p className="text-sm font-medium text-muted-foreground mt-4">Loading subjects...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 min-h-[300px]">
          <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400 opacity-80" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">No subjects found</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            {searchTerm ? "No subjects match your search criteria." : "Get started by adding subjects to your school curriculum."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-11">
              <Plus className="h-4 w-4 mr-2" />
              Create your first subject
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="p-2 group gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-0 flex flex-row items-start justify-between space-y-0">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-blue-600 gap-2 cursor-pointer">
                      <Edit2 className="h-4 w-4" /> Edit Subject
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 gap-2 cursor-pointer">
                      <Trash2 className="h-4 w-4" /> Delete Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="">
                <h3 className="font-bold text-lg leading-tight mb-1 truncate text-foreground">
                  {subject.subject_name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
