"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  User, 
  Search,
  CheckCircle2,
  Users,
  Info,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { toast } from "sonner";

export default function TeacherFeedbackPage() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const [teacher, setTeacher] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingData(true);
        const data = await getTeacherDetails(user.id);
        setTeacher(data);
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSendFeedback = () => {
    if (!selectedStudent || !message.trim()) {
      toast.error("Please select a student and enter a message.");
      return;
    }

    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setMessage("");
      setSelectedStudent("");
      toast.success("Feedback sent successfully!");
    }, 1500);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  // Flatten students from all assigned classes
  const dummyStudents = [
    { id: "s1", name: "Sarah Johnson", class: "10-A" },
    { id: "s2", name: "Michael Chen", class: "10-A" },
    { id: "s3", name: "Emma Davis", class: "9-B" },
    { id: "s4", name: "James Wilson", class: "9-B" },
    { id: "s5", name: "Olivia Martinez", class: "10-B" },
  ];

  return (
    <div className="w-full h-full pb-20 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Student Feedback 💬
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Send direct feedback and personalized guidance to your students
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* FEEDBACK FORM */}
        <div className="md:col-span-3 space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 p-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-600" />
                New Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 focus:ring-purple-500/20 font-medium">
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {dummyStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="rounded-md font-medium">
                        {s.name} ({s.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Feedback Message</label>
                <Textarea 
                  placeholder="Type your feedback here..." 
                  className="min-h-[200px] rounded-lg border-slate-200 focus:ring-purple-500/20 p-4 font-medium resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendFeedback}
                disabled={isSending}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm font-semibold transition-all"
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-white" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* INFO */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-purple-100 dark:border-purple-900/30 overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20 p-6 border-b border-purple-100 dark:border-purple-900/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Info className="h-5 w-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Be Actionable</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Provide clear steps for student improvement.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Encourage Growth</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Focus on potential and positive reinforcement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
