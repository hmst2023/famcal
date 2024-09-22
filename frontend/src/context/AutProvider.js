import { createContext, useState, useEffect } from "react"

const AuthContext = createContext({})
export const AuthProvider = ({children}) => {
    let didInit = false
    var cookie = {}
    for (const x of document.cookie.split('; ')){
      const cookieParts = x.split("=")
      cookie[cookieParts[0]] = cookieParts[1]
  }
  if (cookie.members){
    cookie.members = [...cookie.members.split(',')]
  }
  if (cookie.admin){
    cookie.admin = cookie.admin==="true" ? true : false 
  }
    const [auth, setAuth] = useState(cookie)

    const getNewToken = async() => {
        const timeout = 12000;
        const controller = new AbortController();
        const id2 = setTimeout(() => controller.abort(), timeout);
        
        try {
          const res = await fetch(process.env.REACT_APP_BACKEND_LOCATION+"/users/refreshToken", {
            signal: controller.signal,
            method:"GET",
            headers: {
                    Authorization : `Bearer ${auth}`,
                    "Content-Type": "application/json",
                  }, 

          });
          if (!res.ok){
            setAuth('');
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            document.cookie = "members=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

            let errorResponse = await res.json();
            console.log(errorResponse["detail"]);
          } else {
            let token = await res.json()
            setAuth({...auth, token: token['token']})
            const d = new Date();
            d.setTime(d.getTime() + (31*24*60*60*1000));
            const ck = "token="+token["token"]+"; expires="+d.toUTCString()+"; path=/;samesite=strict";
            document.cookie = ck;
          }
        } catch (error) {
          if (error.name==='AbortError'){
            console.log(['Possible Timeout'])
        } else {
            console.log([error.message])
        }
      };
      clearTimeout(id2);
      }
      useEffect(()=>{
        if (!didInit) {
            Object.keys(cookie).length===0 && getNewToken()  
            didInit = true;
        }
        },[])
    return <AuthContext.Provider value={{auth, setAuth}}>
            {children}
            </AuthContext.Provider>
    }
export default AuthContext
