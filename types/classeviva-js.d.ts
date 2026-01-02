// Type declarations for classeviva.js (unofficial Classe Viva library)
declare module 'classeviva.js' {
  export class Rest {
    constructor()
    login(credentials: { username: string; password: string }): Promise<void>
    logout(): Promise<void>
    getCards(): Promise<any[]>
    getGrades(): Promise<any[]>
    getHomeworks(): Promise<any[]>
    getAbsences(): Promise<any[]>
    getAgenda(): Promise<any[]>
    getDocuments(): Promise<any[]>
    getNoticeboard(): Promise<any[]>
    getSchoolBooks(): Promise<any[]>
    getCalendar(): Promise<any[]>
    getLessons(): Promise<any[]>
    getNotes(): Promise<any[]>
    getPeriods(): Promise<any[]>
    getSubjects(): Promise<any[]>
    getDidactics(): Promise<any[]>
    checkSchool(code: string): Promise<any>
  }

  export class Web {
    constructor()
    // Add Web-specific methods if needed
  }

  export class Tibidabo {
    constructor()
    // Add Tibidabo-specific methods if needed
  }

  export const Enums: any
}
