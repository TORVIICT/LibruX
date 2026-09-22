import { createContext, useContext } from "react";

type User = {
  id: number;
  name: string;
};

const UserContext = createContext<User | null>(null);