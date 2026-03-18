"use client";

import React, { useState } from "react";
import { 
  Building2,
  ChevronRight,
  Edit2,
  GraduationCap,
  Loader2,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { addClass, getClasses } from "@/services/classService";
import { getSchoolDetails } from "@/services/schoolService";
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";


export default function ClassesPage() {
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      getSchoolDetails(user.id).then(setSchool);
    }
  }, [user]);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (school?.id) {
        setLoadingClasses(true);
        const data = await getClasses(school.id);
        if (data) {
          const grouped = data.reduce((acc: any[], row: any) => {
            let cls = acc.find(c => c.name === row.class_name);
            if (!cls) {
              cls = {
                id: row.class_name, 
                name: row.class_name,
                totalStudents: 0,
                sections: []
              };
              acc.push(cls);
            }
            if (row.section) {
              cls.sections.push({
                id: row.id,
                name: row.section,
                students: 0, 
                avatars: [] 
              });
            }
            return acc;
          }, []);
          setClasses(grouped);
        }
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [school]);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSections, setNewSections] = useState([""]); // Start with 1 empty section
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  // Derived state to check if class already exists
  const existingClass = classes.find(c => c.name.toLowerCase() === newClassName.toLowerCase().trim());

  const handleAddSectionInput = () => {
    setNewSections([...newSections, ""]);
  };

  const handleRemoveSectionInput = (index: number) => {
    const updated = newSections.filter((_, i) => i !== index);
    setNewSections(updated);
  };

  const handleSectionChange = (index: number, value: string) => {
    const updated = [...newSections];
    updated[index] = value;
    setNewSections(updated);
  };

  const handleSave = async () => {
    // Basic validation
    if (!newClassName.trim()) return;
    const validSections = newSections.filter(s => s.trim().length > 0);
    if (validSections.length === 0) return;

    setIsSubmitting(true);

    try {
      if (existingClass) {
        // Append sections to existing class
        const updatedClasses = classes.map(c => {
          if (c.id === existingClass.id) {
            const addedSections = validSections.map((s, i) => ({
              id: Math.random(),
              name: s,
              students: 0,
              avatars: []
            }));
            return { ...c, sections: [...c.sections, ...addedSections] };
          }
          return c;
        });
        setClasses(updatedClasses);
        toast.success("Sections added successfully!");
      } else {
        // Create new class
        if (school?.id) {
          await addClass(school.id, newClassName, validSections);
        }
        
        const newClass = {
          id: Math.random(),
          name: newClassName,
          totalStudents: 0,
          sections: validSections.map((s) => ({
            id: Math.random(),
            name: s,
            students: 0,
            avatars: []
          }))
        };
        setClasses([newClass, ...classes]);
        toast.success("Class created successfully!");
      }
      
      // Reset and close
      setNewClassName("");
      setNewSections([""]);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validSectionsCount = newSections.filter(s => s.trim().length > 0).length;
  const isCreateDisabled = !newClassName.trim() || (!existingClass && validSectionsCount === 0);

  return (
    <div className="w-full h-full pb-20 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-muted/50 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Classes & Sections</h2>
            <span className="text-3xl">🏫</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your school's classes, sections, and organizational structure
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg flex items-center gap-2 h-11 px-6">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add Class</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new class or add sections to an existing one.
              </p>
            </DialogHeader>
            <div className="grid gap-6 py-4 mt-2">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold">Class Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Class 10" 
                    className="pl-9 h-11 rounded-lg" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                {existingClass && newClassName.trim() !== "" && (
                  <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 p-3 rounded-lg text-xs font-medium border border-purple-100 dark:border-purple-800/30">
                    <span className="text-lg">✨</span>
                    Class already exists. You are now adding sections to {existingClass.name}.
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Sections</label>
                  <Button variant="ghost" size="sm" onClick={handleAddSectionInput} className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Section
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto px-1 py-1">
                  {newSections.map((sec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input 
                        placeholder={`Section Name (e.g. A)`} 
                        className="h-10 rounded-lg flex-1" 
                        value={sec}
                        onChange={(e) => handleSectionChange(idx, e.target.value)}
                      />
                      {newSections.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSectionInput(idx)} className="text-muted-foreground hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0 pt-2 border-t border-muted/30">
              <Button type="button" variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto h-10" disabled={isCreateDisabled || isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {existingClass ? 'Add Sections' : 'Create Class'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loadingClasses ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 min-h-[400px]">
          <Spinner />
          <p className="text-sm font-medium text-muted-foreground mt-4">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 min-h-[400px]">
          <div className="h-24 w-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-12 w-12 text-purple-600 dark:text-purple-400 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">No classes created yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Get started by setting up your school's classes and assigning sections to them.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg h-11 px-6">
            <Plus className="h-4 w-4 mr-2" />
            Create your first class
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="rounded-xl shadow-sm border-muted/60 overflow-hidden bg-white dark:bg-zinc-950 transition-all hover:border-purple-200 dark:hover:border-purple-800">
              
              {/* CLASS HEADER */}
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-muted/30 bg-slate-50/30 dark:bg-slate-900/20 px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">{"Class " + cls.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-50 border-0 font-semibold px-2.5">
                        {cls.sections.length} Sections
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center font-medium">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {cls.totalStudents} Students
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-80 hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-9 font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Section
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {/* CLASS BODY (SECTIONS GRID) */}
              <CardContent className="px-6 py-2">
                {cls.sections.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {cls.sections.map((section: any) => (
                      <div 
                        key={section.id} 
                        className="group relative flex flex-col p-4 w-40 rounded-xl border bg-white dark:bg-zinc-950 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-foreground text-base tracking-tight">{"Section " + section.name}</h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                            <button className="text-muted-foreground hover:text-blue-600 p-1">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button className="text-muted-foreground hover:text-red-600 p-1">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-xs font-medium text-muted-foreground flex items-center bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">
                            <Users className="h-3 w-3 mr-1.5 text-indigo-500" />
                            {section.students} Students
                          </span>
                          
                          {section.avatars.length > 0 && (
                            <div className="flex -space-x-2">
                              {section.avatars.slice(0, 3).map((avatarSrc: string, i: number) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-zinc-950">
                                  <AvatarImage src={avatarSrc} />
                                  <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">NA</AvatarFallback>
                                </Avatar>
                              ))}
                              {section.avatars.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                  +{section.avatars.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-muted">
                    No sections added yet!
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
