"use client"

import { useUser } from "./use-user"

export function useUserRole() {
  const { user, loading } = useUser()

  const role = user?.role as string | undefined

  const isAdmin = role === "admin"
  const isStaff = role === "staff"
  const isTeacher = role === "teacher"
  const isStudent = role === "student"
  const isHacker = role === "hacker"

  return {
    user,
    loading,
    isAdmin,
    isStaff,
    isTeacher,
    isStudent,
    isHacker,
    canAccessDashboard: isAdmin || isStaff || isHacker,
  }
}
