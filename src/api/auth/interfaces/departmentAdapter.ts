export interface DepartmentAdapter {
  findDepartmentById(departmentId: string): Promise<any>;
  addUserToDepartment(userId: string, departmentId: string): Promise<any>;
}
