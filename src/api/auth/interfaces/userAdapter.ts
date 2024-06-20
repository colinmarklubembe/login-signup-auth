export interface UserAdapter {
  createUser(data: any): Promise<any>;
  findUserByEmail(email: string): Promise<any>;
}
