interface LoginUser {
    email: string;
    password: string;
}

interface RegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age: number;
    contactNumber: string;
    // avatar: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    contactNumber: string;
    // avatar: string;
}



export type { LoginUser, RegisterUser, User };
