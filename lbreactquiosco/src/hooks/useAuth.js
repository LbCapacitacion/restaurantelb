import { useEffect } from "react"
import clienteAxios from "../config/axios"
import useSWR from "swr"
import { useNavigate } from "react-router-dom"




export const useAuth = ({ middleware, url }) => {

    const token = localStorage.getItem('AUTH_TOKEN')
    const navigate = useNavigate()

    const { data: user, error, mutate } = useSWR(token ? '/api/user' : null, () => 
         clienteAxios('/api/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('AUTH_TOKEN')

                    mutate(undefined, { revalidate: false })
                }
                throw Error(error?.response?.data?.errors)
            })
    )

    const login = async (datos, setErrores) => {
        try {
            const { data } = await clienteAxios.post('/api/login', datos)

            localStorage.setItem('AUTH_TOKEN', data.token)
            setErrores([])
            await mutate(data.user)
        } catch (error) {
            setErrores(Object.values(error.response.data.errors))
        }
    }

    const registro = async(datos, setErrores) => {
        try{
            const {data} = await clienteAxios.post('/api/registro', datos)

            localStorage.setItem('AUTH_TOKEN', data.token)
            setErrores([])
            await mutate(data.user)
        }catch(error){
            setErrores(Object.values(error.response.data.errors))
        }
    }

    const logout = async () => {
        try {
            await clienteAxios.post('/api/logout')

            localStorage.removeItem('AUTH_TOKEN')

            await mutate(undefined, { revalidate: false })
            navigate('/auth/login')


        } catch (error) {
            console.error("Error al cerrar sesion:", error)
            localStorage.removeItem('AUTH_TOKEN')
            await mutate(undefined, { revalidate: false })
            navigate('/auth/login')
        }
    }

    useEffect(() => {
        if (middleware === 'guest' && user) {
            if (user.admin) {
                navigate('/admin');
            } else if (url) {
                navigate(url)
            }
        }
        if (middleware === 'admin' && user && !user.admin) {
            navigate('/')
        }
        if (middleware === 'auth' && error) {
            navigate('/auth/login')
        }
    }, [user, error, navigate, middleware, url])

    return {
        login,
        registro,
        user,
        logout,
        error
    }
}

export default useAuth;

