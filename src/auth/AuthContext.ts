import { createContext } from "react";

interface Context {
  hexKey?: string | null;
  setHexKey?: React.Dispatch<React.SetStateAction<string | null>>;
  keyName?: string | null;
  setKeyName?: React.Dispatch<React.SetStateAction<string | null>>;
  logout?: () => void;
}

const AuthContext = createContext<Context>({});

export default AuthContext;