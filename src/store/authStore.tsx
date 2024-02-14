import { action, makeObservable ,observable } from "mobx"
import { IRootStore } from "./rootStore";
export default class AuthContext {
    BASE_URL = process.env.REACT_APP_API_URL + '/auth'
    isAuthenticated: boolean = false;
    token: string | null = null
    rootStore: IRootStore 
    constructor(rootStore: IRootStore) {
        makeObservable(this, {
            isAuthenticated: observable,
            token: observable,
            setIsAuthenticated: action,
            setToken: action,
            login: action,
            logout: action
        });
        this.rootStore = rootStore;
        this.setToken(localStorage.getItem('_token'))
        if(this.token) this.isAuthenticated = true
    }
    setIsAuthenticated = (value: boolean) => {
        this.isAuthenticated = value;
        if(!value){ this.setToken(null)}
    }
    setToken = (value : string |null ) => {
        if(value) {
            localStorage.setItem("_token", value);
        } else {
            localStorage.removeItem("_token");
        }
        this.token = value;
    }
    login = async (postData: any) => {
        try {
            const response = await fetch(this.BASE_URL+'/login',{
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(postData)
            })
            const data = await response.json()
            if(data.error){
                this.rootStore.handleError(response.status,data.message,data)
                return Promise.reject(data)
            } else {
                this.setIsAuthenticated(true)
                this.setToken(data.access_token)
                return Promise.resolve(data)
            }
        } catch(error : any ){
            this.rootStore.handleError(419, "Something gets wrong" , error)
        }
    }
    logout = async () =>{
        try {
            const response = await fetch(this.BASE_URL+'/logout',{
                method: 'POST',
                headers: {
                    'Authorization' : `Bearer ${this.token}`,
                    'Content-type': 'application/json',
                }
            })
            const data = await response.json()
            if(data.error){
                this.rootStore.handleError(response.status,data.message,data)
                return Promise.reject(data)
            } else {
                this.setIsAuthenticated(false)
                return Promise.resolve(data)
            }
        } catch (error) {
            this.rootStore.handleError(419, "Something gets wrong" , error)
        }
    }
}