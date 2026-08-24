export interface DateRange {
  start: string;
  end: string;
}

export interface Role {
  company: string;
  title: string;
  dates: DateRange;
  summary: string;
  highlights: string[];
  tech: string[];
}

export interface CondensedRole {
  company: string;
  title?: string;
  dates?: DateRange;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Profile {
  name: string;
  roleLine: string;
  heroHook: string;
  about: {
    paragraphs: string[];
  };
  contact: {
    email: string;
    company: string;
    location: string;
    availableForConsulting: boolean;
    statusLine: string;
  };
}
