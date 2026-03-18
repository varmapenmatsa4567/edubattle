"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getSchoolDetails } from "@/services/schoolService";
import { getStudents } from "@/services/studentService";
import { getTeachers } from "@/services/teacherService";
import { Spinner } from "@/components/ui/spinner";

const SchoolPage = () => {
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const [school, setSchool] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const schoolData = await getSchoolDetails(user.id);
        setSchool(schoolData);

        if (schoolData?.id) {
          const [studentsData, teachersData] = await Promise.all([
            getStudents(schoolData.id),
            getTeachers(schoolData.id)
          ]);
          
          if (studentsData) setStudents(studentsData);
          if (teachersData) setTeachers(teachersData);
        }
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 space-y-4">

      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">School Dashboard 🏫</h2>
        <p className="text-muted-foreground text-sm">
          Manage your school and track performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Teachers
            </CardTitle>
						<div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teachers.length}</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              +3 new this month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Quizzes
            </CardTitle>
						<div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">320</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              +15 this week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Growth Rate
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+12%</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              Above target
            </p>
          </CardContent>
        </Card>
      </div>

			<div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        {/* Top Performers Section */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight">Top Performers</h3>
              <span className="text-xl">🌟</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Students with highest XP this month
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Top Performer 1 */}
            <Card className="rounded-xl shadow-sm border-2 border-yellow-200/50 bg-yellow-50/30 dark:bg-yellow-900/10 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-yellow-200/50 to-transparent rounded-bl-full z-0"></div>
              <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10 pt-8">
								<div className="absolute top-3 left-3 bg-yellow-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
                <Avatar className="h-16 w-16 mb-3 border-2 border-yellow-400">
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">SJ</AvatarFallback>
									<AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
                </Avatar>
                <h4 className="font-semibold text-foreground">Sarah Johnson</h4>
                <p className="text-xs text-muted-foreground mb-4">Grade 10-A</p>
                <div className="flex items-center justify-between w-full mt-auto">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-yellow-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span className="text-sm font-bold text-foreground">2850</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">XP</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-purple-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                      <span className="text-sm font-bold text-foreground">Rank #1</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performer 2 */}
            <Card className="rounded-xl shadow-sm border-2 border-slate-200/50 bg-slate-50/50 dark:bg-slate-900/30 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-slate-200/50 to-transparent rounded-bl-full z-0"></div>
              <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10 pt-8">
								<div className="absolute top-3 left-3 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
                <Avatar className="h-16 w-16 mb-3 border-2 border-slate-400">
                  <AvatarFallback className="bg-emerald-500 text-white font-semibold">ED</AvatarFallback>
									<AvatarImage src="https://i.pravatar.cc/150?u=emma" />
                </Avatar>
                <h4 className="font-semibold text-foreground">Emma Davis</h4>
                <p className="text-xs text-muted-foreground mb-4">Grade 10-B</p>
                <div className="flex items-center justify-between w-full mt-auto">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-yellow-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span className="text-sm font-bold text-foreground">2720</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">XP</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-purple-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                      <span className="text-sm font-bold text-foreground">Rank #2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performer 3 */}
            <Card className="rounded-xl shadow-sm border-2 border-orange-200/50 bg-orange-50/30 dark:bg-orange-900/10 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-orange-200/50 to-transparent rounded-bl-full z-0"></div>
              <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10 pt-8">
								<div className="absolute top-3 left-3 bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
                <Avatar className="h-16 w-16 mb-3 border-2 border-orange-500">
                  <AvatarFallback className="bg-red-500 text-white font-semibold">MC</AvatarFallback>
									<AvatarImage src="https://i.pravatar.cc/150?u=michael" />
                </Avatar>
                <h4 className="font-semibold text-foreground">Michael Chen</h4>
                <p className="text-xs text-muted-foreground mb-4">Grade 9-A</p>
                <div className="flex items-center justify-between w-full mt-auto">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-yellow-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span className="text-sm font-bold text-foreground">2680</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">XP</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-purple-500">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                      <span className="text-sm font-bold text-foreground">Rank #3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Goals Section */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1">
          <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950 h-full p-6 pb-8">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Monthly Goals</h3>
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Track your progress this month
              </p>
            </div>

            <div className="space-y-8">
              {/* Goal 1 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Conduct Quizzes</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Target: 50 quizzes</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">30/50</span>
                </div>
                <Progress value={60} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">60% complete</p>
              </div>

              {/* Goal 2 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Improve Accuracy</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">From 70% to 82%</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">82/100</span>
                </div>
                <Progress value={82} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">82% complete</p>
              </div>

              {/* Goal 3 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Student Engagement</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Active students</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1050/1200</span>
                </div>
                <Progress value={87.5} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">87.5% complete</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default SchoolPage;