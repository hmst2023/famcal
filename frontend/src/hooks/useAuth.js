import { useContext } from "react";
import AuthContext from "../context/AutProvider";
const useAuth =()=>{
    return useContext(AuthContext)
}
export default useAuth;