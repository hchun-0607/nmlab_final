import { useState,useContext,createContext } from "react";
import React from "react";

const WS_URL=process.env.NODE_ENV==="production"?
    window.location.origin.replace(/^http/,"ws"):
    "ws://localhost:5000";
let client=new WebSocket(WS_URL);

const ChatContext = createContext({
    stat:'',
    task:'',
    sup:'',
    mat:'',
    val:'',
    valType:'',
    userData:'',
    setMat:()=>{}, //fot material inventory
    setSup:()=>{}, // for suppliers
    setBom:()=>{}, //for bom
    setStat:()=>{}, //for account settings
    setTask:()=>{}, //for value target 3 categories
    setVal:()=>{}, //for value targets
    setValType:()=>{},
    setUserData:()=>{},
    

});

const ChatProvider = (props) => {
    const [task, setTask] = useState("");
    const [stat, setStat] = useState(null);
    const [sup, setSup] = useState(null)
    const [bom, setBom] = useState(null)
    const [mat, setMat] = useState("")
    const [val, setVal] = useState(null)
    const [valType, setValType] = useState("")

    const [userData, setUserData] = useState({
        Username: "",
        Account: "",
        Email: "",
        Password: "",
        Permission: "",
        Status: "",
    });

    

    return (
        <ChatContext.Provider
            value={{
                // val,
                task,
                setTask,
                stat,
                setStat,
                sup,
                setSup,
                bom,
                setBom,
                mat,
                setMat,
                val, 
                setVal,
                valType, 
                setValType,
                userData,
                setUserData,
            }}
            {...props}
        />
    );
};
const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat , client };
// export default ChatContext
