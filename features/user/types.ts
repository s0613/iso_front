// Role enum matching the Spring Boot backend
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// User interface
export interface User {
  id: number;
  email: string;
  name: string;
  company: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
} 