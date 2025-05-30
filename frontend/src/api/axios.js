import React  from "react";
import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5000"; // Change this to your actual API URL

const ChatContext = createContext({
  val: "",
  setVal: () => {},
  sendValue: () => {},
  signIn: () => {},
  suppliers: [],
});

const ChatProvider = (props) => {
  const [val, setVal] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const sendValue = async (payload) => {
    try {
      await axios.post(`${API_BASE_URL}/sendVal`, payload);
    } catch (error) {
      console.error("Error sending value:", error);
    }
  };

  const signIn = async (payload) => {
    try {
      await axios.post(`${API_BASE_URL}/signIn`, payload);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getSupplier`);
      const { Val, sup } = response.data;
      setVal(Val);
      setSuppliers(sup);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const sendValueToServer = async (value) => {
    // Create the payload object to send to the server
    const payload = {
      value,
    };

    try {
      await axios.post(`${API_BASE_URL}/sendValueToServer`, payload);
    } catch (error) {
      console.error("Error sending value to server:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        val,
        sendValue,
        setVal,
        signIn,
        suppliers,
        sendValueToServer, // Adding the sendValueToServer function to the context
      }}
      {...props}
    />
  );
};

const useChat = () => useContext(ChatContext);

export { ChatProvider, useChat };
