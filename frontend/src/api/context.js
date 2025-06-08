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
    memberData:'',
    isPhoneVerified:'',
    restaurantList:'',
    reservationData:'',
    setMat:()=>{}, //fot material inventory
    setSup:()=>{}, // for suppliers
    setBom:()=>{}, //for bom
    setStat:()=>{}, //for account settings
    setTask:()=>{}, //for value target 3 categories
    setVal:()=>{}, //for value targets
    setValType:()=>{},
    setUserData:()=>{},
    setMemberData:()=>{},
    setIsPhoneVerified:()=>{},
    setRestaurantList:()=>{},
    setReservationData:()=>{},
    

});

const ChatProvider = (props) => {
    const [task, setTask] = useState("");
    const [stat, setStat] = useState(null);
    const [sup, setSup] = useState(null)
    const [bom, setBom] = useState(null)
    const [mat, setMat] = useState("")
    const [val, setVal] = useState(null)
    const [valType, setValType] = useState("")
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [restaurantList, setRestaurantList] = useState([]);


    const [userData, setUserData] = useState({
        Username: "",
        Account: "",
        Email: "",
        Password: "",
        Permission: "",
        Phone:"",
        Status: "",
    });
    const [memberData, setMemberData] = useState({
        username: "",
        account: "",
        email: "",
        password: "",
        password2:"",
        passkey:"",
        phone:"",
        verificationCode:"",
    });
    const [reservationData, setReservationData] = useState({
        restaurant_id: "",
        restaurant_name: "",
        date:"",
        time:"",
        people:"",
        reserver_name:'',
        reserver_account:'',
        reserver_adress:'',
        reserver_phone:'',
        reserver_email:'',
        VP:'',//VC、DID
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
                memberData,
                setMemberData,
                isPhoneVerified,
                setIsPhoneVerified,
                restaurantList,
                setRestaurantList,
                reservationData,
                setReservationData,
            }}
            {...props}
        />
    );
};
const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat , client };
// export default ChatContext
