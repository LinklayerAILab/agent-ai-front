"use client";
import axios from "axios";
import { message } from "antd";

// const { info } = Modal;
export const service = axios.create({
  // Set the baseur address. If you cross domains through proxy, you can directly fill in the base address
  baseURL: "",
  // Define unified request headers
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
  // Configure request timeout
  timeout: 60000,
});
// Request interception
service.interceptors.request.use((config) => {
    const Address = localStorage.getItem("address");
    const access_token = localStorage.getItem("access_token");
    // const source = localStorage.getItem("Source");
    if (Address) {
      config.headers.set("Address", Address);
    }
    // if(source){
    //   config.headers.set("Source", source);
    // }
    config.headers.set("Source", '1');
    if (access_token) {
      config.headers.set("Authorization", `Bearer ${access_token || ""}`);
    }

  return config;
});
// let modalFlag = false;
service.interceptors.response.use(
  (response) => {
    const { status } = response;
    if (status !== 200) {
      return Promise.reject(response);
    } else {
      if(response.data.code !==0) {
        return Promise.reject(response);
      }
      return response.data;
    }
  },
  (error) => {

    if (error.response.data.code === 401) {
      // modalFlag = true;
      // message.warning("The login is invalid");
      window.dispatchEvent(new Event('unauthorized'));
      localStorage.removeItem("access_token");

    } else {
      message.error(
        error.response.data.message ||
          error.response.statusText ||
          JSON.stringify(error.response)
      );
    }

    return Promise.reject(error);
  }
);
