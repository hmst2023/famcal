import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
    const emptyFormValue = {
        oldPass:"",
        newPass:"",
        verifyPass:""
    }
    var blubb
    var blobb
    var plopp
    const {auth, setAuth} = useAuth();
    const [apiError,setApiError] = useState();
    const [addDescription, setAddDescription] = useState();
    const [irreversibleError, setIrreversibleError] =useState();
    const [degradeDescription,setDegradeDescription] = useState({});
    const [otherDescription,setOtherDescription] = useState({});
    const [addOtherError,setAddOtherError] = useState();
    const [upgradeOtherMessage,setUpgradeOtherMessage] = useState({});
    const [degradeUserError,setDegradeUserError] = useState({});
    const [upgradeOtherError,setUpgradeOtherError] = useState({});
    const [showAddOther, setShowAddOther] = useState(false);
    const [showUpgradeOther, setShowUpgradeOther] = useState({});
    const [famConstellation, setFamConstellation] = useState({users:[], others:[]});
    const [formValues, setFormValues] = useState(emptyFormValue)
    const [refreshFetch, setRefreshFetch] = useState(true);

    let navigate = useNavigate();

    const onFormReset = ()=> {
        setFormValues(emptyFormValue);
        navigate("/setup", {replace:true});
      };
    const handleIrreversibleClick = async (e) => {
      e.preventDefault();
      const timeout = 8000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        if (!window.confirm("Bist du ganz sicher!")) {throw new Error('Aborted')}
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/proposefam", {
          signal:controller.signal,
          method:"Delete",
          headers:{
              "Content-Type":"application/json",
              Authorization : `Bearer ${auth.token}`,
          }
        });
          if (response.ok){
            setIrreversibleError(["Deleted everything"]);
            setAuth({})
            navigate("/login", {replace:true})
  
          } else{
            let errorResponse = await response.json();
            setIrreversibleError(errorResponse["detail"]);
          }
      } catch (error) {
        if (error.name==='AbortError'){
          setIrreversibleError('Possible Timeout')
        } else {
          setIrreversibleError(error.message)
        }
      };
      clearTimeout(id);
      

    }
    const onFormSubmit = async (e)=>{
    e.preventDefault();
    const timeout = 8000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    let dict = {old: e.target.oldPass.value, new: e.target.newPass.value}    
    try {
      if (e.target.newPass.value !== e.target.verifyPass.value){
        throw new Error("Verify Password does not match")
      }
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/change_pass", {
        signal:controller.signal,
        method:"PATCH",
        headers:{
            "Content-Type":"application/json",
            Authorization : `Bearer ${auth.token}`,
        },
        body:JSON.stringify(dict)});
        if (response.ok){
          const token = await response.json();
          setApiError(["password changed"]);
          setFormValues(emptyFormValue);
        } else {
          let errorResponse = await response.json();
          setApiError(errorResponse["detail"]);
        }
    } catch (error) {
      if (error.name==='AbortError'){
        setApiError('Possible Timeout')
      } else {
        setApiError(error.message)
      }
    };
    clearTimeout(id);

  }
  function handleChange(e){
      setFormValues({...formValues, [e.target.name]: e.target.value });
  }
  async function handleAddOther(e){
      e.preventDefault();
      const timeout = 8000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      let dict = {name: e.target.addOtherField.value}    
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/add", {
          signal:controller.signal,
          method:"POST",
          headers:{
              "Content-Type":"application/json",
              Authorization : `Bearer ${auth.token}`,
          },
          body:JSON.stringify(dict)});
          if (response.ok){
            var blubb = auth
            blubb.members.push(dict.name)
            setAuth(blubb);
            setRefreshFetch(!refreshFetch)
            showAddOtherHandler()
          } else{
            let errorResponse = await response.json();
            setAddOtherError(errorResponse["detail"]);
          }
      } catch (error) {
        if (error.name==='AbortError'){
          setAddOtherError('Possible Timeout')
        } else {
          setAddOtherError(error.message)
        }
      };
      clearTimeout(id);
  
    }
    async function handleRemoveOther(e){
        e.preventDefault();
        const timeout = 8000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        let dict = {name: e.currentTarget.getAttribute("data-value")}    
        try {
          const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/add", {
            signal:controller.signal,
            method:"DELETE",
            headers:{
                "Content-Type":"application/json",
                Authorization : `Bearer ${auth.token}`,
                other: dict.name
            }
            });
            if (response.ok){
              var blubb = auth
              var index = blubb.members.indexOf(dict.name)
              blubb.members.splice(index,1)
              setAuth(blubb)
              setRefreshFetch(!refreshFetch)
            } else{
              let errorResponse = await response.json();
              setAddOtherError(errorResponse["detail"]);
            }
        } catch (error) {
          if (error.name==='AbortError'){
            setAddOtherError('Possible Timeout')
          } else {
            setAddOtherError(error.message)
          }
        };
        clearTimeout(id);
  
    }
    async function handleDegradeUser(e){
      e.preventDefault();
      const timeout = 8000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      let dict = {username: e.currentTarget.getAttribute("data-value")}
      var blobb
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/propose", {
          signal:controller.signal,
          method:"DELETE",
          headers:{
              "Content-Type":"application/json",
              Authorization : `Bearer ${auth.token}`,
              user: dict.username
          }
          });
          if (response.ok){
            setRefreshFetch(!refreshFetch)
          } else{
            let errorResponse = await response.json();
            console.log(errorResponse["detail"])
            blobb ={...degradeUserError}
            blobb[dict.username] = errorResponse["detail"]
            setDegradeUserError(blobb);
          }
      } catch (error) {
        if (error.name==='AbortError'){
          blobb ={...degradeUserError}
          blobb[dict.username] = 'Possible Timeout'
          setDegradeUserError(blobb)
        } else {
          blobb ={...degradeUserError}
          blobb[dict.username] = error.message
          setDegradeUserError(blobb)
        }
      };
      clearTimeout(id);
      if (!auth.admin) {
        setAuth({})
        navigate("/login", {replace:true})
      }

  }
    async function handleUpgradeOther(e){
      e.preventDefault();
      const timeout = 8000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      let dict = {username: e.currentTarget.getAttribute("data-value"), email: e.target[0].value}
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/users/propose", {
          signal:controller.signal,
          method:"POST",
          headers:{
              "Content-Type":"application/json",
              Authorization : `Bearer ${auth.token}`,
          },
          body:JSON.stringify(dict)});
          if (response.ok){
            blubb = {...upgradeOtherMessage}
            blubb[dict.username] = "Invited for registration"
            setUpgradeOtherMessage(blubb)

            blobb ={...upgradeOtherError}
            blobb[dict.username] = false
            setUpgradeOtherError(blobb);

            plopp = showUpgradeOther
            plopp[dict.username]=!plopp[dict.username]
            setShowUpgradeOther(plopp)

            setRefreshFetch(!refreshFetch)
          } else{
            let errorResponse = await response.json();
            blubb = {...upgradeOtherError}
            blubb[dict.username] = errorResponse["detail"]
            setUpgradeOtherError(blubb);
          }
      } catch (error) {
        if (error.name==='AbortError'){
          blubb = {...upgradeOtherError}
          blubb[dict.username] = 'Possible Timeout'
          setUpgradeOtherError(blubb)
        } else {
          blubb = {...upgradeOtherError}
            blubb[dict.username] = error.message
          setUpgradeOtherError(blubb)
        }
      };
      clearTimeout(id);

  }

    function showAddOtherHandler(){
      setShowAddOther(!showAddOther)
    }
    function showUpgradeOtherFieldHandler(e){
      var blubb = showUpgradeOther
      blubb[e.currentTarget.getAttribute("data-value")] = !blubb[e.currentTarget.getAttribute("data-value")]
      setShowUpgradeOther(blubb)
      setRefreshFetch(!refreshFetch)
    }

    function handleDegradeDescription(e){
      var blubb = {}
      blubb[e.currentTarget.getAttribute("data-value")] = <span className='text-xs text-red-700'> Degrade user to other member without login</span>
      setDegradeDescription(blubb)
    }
    function handleAddDescription(e){
       setAddDescription(<span className='text-xs text-blue-700'> Add name to other members</span>)
    }
    function handleOtherDescription(e){
      var blubb = {...otherDescription}
      if (e.target.outerText==="remove"){
        blubb[e.currentTarget.getAttribute("data-value")] = <span className='text-xs text-red-700'>&nbsp;Erase user from other members</span>
      } else {
        blubb[e.currentTarget.getAttribute("data-value")] = <span className='text-xs text-blue-700'>&nbsp;Upgrade to user with login</span>
      }
      setOtherDescription(blubb)
    }
    function eraseDegradeDescription(e){
      setDegradeDescription({})
    }
    function eraseOtherDescription(e){
      var blubb = {...otherDescription}
      if (!showUpgradeOther[e.currentTarget.getAttribute("data-value")]){
        blubb[e.currentTarget.getAttribute("data-value")] = ""
        
      }
      setOtherDescription(blubb)
      
    }
    function eraseAddDescription(e){
      if (!showAddOther){
        setAddDescription()
      }
    }
    
    function FamilySetup(){
      useEffect(() => {
        fetch(process.env.REACT_APP_BACKEND_URL + "/users/setup", {
          method:"GET",
          headers: {
              "Content-Type": "application/json",
              Authorization : `Bearer ${auth['token']}`,
          }
      })
          .then(response=>response.json())
          .then(data=>setFamConstellation(data))
    
      },[refreshFetch])
        return (
            <div className='App max-w-6xl mx-auto bg-aubergine px-8 py-6'>
             <h1 className='font-bold text-lg leading-loose py-2'>Setup Family Settings</h1>
             <div>Regular Users</div>
             {famConstellation.users.map(user=>{return <div className='indent-4 py-1' key={user.name}>{user.name} {user.email} {!user.admin && <button onMouseOut={eraseDegradeDescription} onMouseOver={handleDegradeDescription} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white px-1 border border-red-500 hover:border-transparent rounded" data-value={user.name} onClick={handleDegradeUser}>degrade</button>}{degradeDescription[user.name]}</div>})}
             
             <p>&nbsp;</p>
             <p>Other members</p>
             {famConstellation.others.map(others=>{return( 
              <div className='indent-4 py-1' key={others}>{others} &nbsp; 
              <button data-value={others} onClick={showUpgradeOtherFieldHandler} onMouseOver={handleOtherDescription} onMouseOut={eraseOtherDescription} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-1 border border-blue-500 hover:border-transparent rounded">upgrade</button> 
              {!showUpgradeOther[others] && <span>&nbsp;<button data-value={others} onClick={handleRemoveOther} onMouseOver={handleOtherDescription} onMouseOut={eraseOtherDescription} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white px-1 border border-red-500 hover:border-transparent rounded">remove</button></span>}
              {otherDescription[others]}{showUpgradeOther[others] &&
              <div className='flex py-2'> 
              <form data-value={others} onSubmit={handleUpgradeOther} className='indent-20'>
                email: <input name={`UpgradeOtherField${others}`} type='email' required/><br/>
                <div className='text-right text-lg'>
                  <p>&nbsp;{upgradeOtherError[others]}</p>
                  <input className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"type='submit'/><br/>
                  <span className='text-sm'>
                      <input className='py-2 px-4' type="reset" onClick={onFormReset}/>
                      <hr/>
                  </span>
                </div>
              </form>
              </div>
              }{upgradeOtherMessage[others]}
              </div>
             )})}
              <p>&nbsp;</p>
              <button onClick={showAddOtherHandler} onMouseOver={handleAddDescription} onMouseOut={eraseAddDescription} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-1 border border-blue-500 hover:border-transparent rounded">add</button>{addDescription}{showAddOther &&
              <div className='flex py-2'>

              <form onSubmit={handleAddOther}>
                name: <input name="addOtherField" type='text' required/><br/>
                <div className='text-right text-lg'>
                <p>&nbsp;{addOtherError}</p>
                <input className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type='submit'/><br/>
                <span className='text-sm'>
                    <input className='py-2 px-4' type="reset" onClick={onFormReset}/>
                    </span>
                </div>
                
              </form>
              </div>}
              <p>&nbsp;{addOtherError}</p>
              
             
            </div>
        )
    }
  return (
    <div>
      <div className='bg-aubergine px-8 py-6'>
        <h1 className='font-bold text-lg leading-loose py-2'>Setup Personal Settings</h1>
        <div className='flex'>
        <form onSubmit={onFormSubmit} onReset={onFormReset} autoComplete='off'>
          actual password: <input value={formValues.oldPass} onChange={handleChange} type="password" name="oldPass" required/><br/>
          <p>&nbsp;</p>
          new passwort: &nbsp;&nbsp;&nbsp;&nbsp;<input value={formValues.newPass} type="password" name="newPass" onReset={onFormReset} onSubmit={onFormSubmit} onChange={handleChange} autoComplete="new-password" required/><br/>
          <p>&nbsp;</p>
          Verify Password: <input value={formValues.verifyPass} minLength="4" name='verifyPass' type='password'  onChange={handleChange} required/>
          <p className='text-right text-xs text-red-500'>&nbsp; {apiError}</p>
          <div className='text-right text-lg'>
          <input className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" type="submit"/> <br/>
          <span className='text-sm'>
          <input className='py-2 px-4' type="reset"/>
          </span></div>
          </form>
      </div>
      <div>{auth.admin ? <button className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white px-1 border border-red-500 hover:border-transparent rounded" onClick={handleIrreversibleClick}>Irreversible delete all family data now</button>:<button data-value={auth.username} onClick={handleDegradeUser} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white px-1 border border-red-500 hover:border-transparent rounded">Delete my Account</button>}</div> 
      {auth.admin && <p className='text-xs text-red-500'>{irreversibleError}</p>}
      </div>
      <div>
        {auth?.admin && FamilySetup()}
      </div>




    </div>
  )
}

export default Setup