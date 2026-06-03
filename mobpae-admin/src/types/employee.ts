export type Employee = {
  id: string;
  userId: string;
  employerId: string;

  employeeCode: string;

  name: string;
  email: string;
  phone: string;

  salaryInHand: string;

  joiningDate: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;

  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    status: string;
  };
};
