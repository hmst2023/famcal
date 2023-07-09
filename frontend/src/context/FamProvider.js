import { createContext, useState } from "react"

const FamContext = createContext({})
export const FamProvider = ({children}) => {
    var [fam, setFam] = useState(['Nora', 'Livia', 'Martina', 'Hannes'])
    return <FamContext.Provider value={{fam, setFam}}>
            {children}
            </FamContext.Provider>
    }
export default FamContext
