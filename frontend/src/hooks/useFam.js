import { useContext } from "react";
import FamContext from "../context/FamProvider";
const useFam =()=>{
    return useContext(FamContext)
}
export default useFam;