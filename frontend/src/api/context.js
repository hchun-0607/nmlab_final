import { useState,useContext,createContext } from "react";
import React from "react";

const WS_URL=process.env.NODE_ENV==="production"?
    window.location.origin.replace(/^http/,"ws"):
    "ws://localhost:5000";
let client=new WebSocket(WS_URL);

const ChatContext = createContext({
    stat:'',
    did:'',
    vc:'',
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
    reservationList:'',
    credentialId:'',
    setVc:()=>{},
    setDid:()=>{},
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
    setReservationList:()=>{},
    setCredentialId:()=>{},
    

});

const ChatProvider = (props) => {
    const [task, setTask] = useState("");
    const [stat, setStat] = useState(null);
    const [sup, setSup] = useState(null)
    const [bom, setBom] = useState(null)
    const [mat, setMat] = useState("")
    const [val, setVal] = useState(null)
    const [credentialId, setCredentialId] = useState(null)
    const [valType, setValType] = useState("")
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [restaurantList, setRestaurantList] = useState([]);
    const [did, setDid] = useState([]);
    const [vc, setVc] = useState([]);
    const [reservationList, setReservationList] = useState();
    



    const [userData, setUserData] = useState({
        Username: "",
        Account: "",
        Email: "",
        Password: "",
        Permission: "",
        Phone:"",
        Status: "",
        Did:"",
        CredDid:'',
        Wallet_address:'',
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
        publickey:'',
        did:"",
        credid:"",
        Wallet_address:'',
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
        wallet_address:'',
        deposit:'',
    });

    

    return (
        <ChatContext.Provider
            value={{
                // val,
                vc,
                setVc,
                task,
                setTask,
                did,
                setDid,
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
                credentialId,
                setCredentialId,
                reservationList,
                setReservationList,
            }}
            {...props}
        />
    );
};
const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat , client };
// export default ChatContext
