//Import
import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'

//Main import
import './style.css'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map,TileLayer,Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
// Evente click map
import {LeafletMouseEvent} from 'leaflet'

import logo from '../../asset/logo.svg'

//Informa que tipo de dado será armazenado dentro do array ou objeto
interface Item{
    id:number
    title:string
    image_url:string
}
interface IBGEUFResponse{
    sigla:string
}

interface IBGECityResponse{
    nome:string
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [ufs,setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    
    //state
    const [selectedUf,setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    //history
    const history = useHistory()
    //Data form storage

    const [formData, setFormeData ] = useState({
        name:'',
        email:'',
        whatsapp: ''
    })



    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position=>{
            const {latitude, longitude} = position.coords

            setInitialPosition([latitude, longitude])
        })

    }, [])

    useEffect(()=>{
        api.get('items').then(response=>{
            setItems(response.data)
        })
    },[])

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then(response =>{
            const ufinitials = response.data.map(uf => uf.sigla)
            
            setUfs(ufinitials)
        })
    },[])
   
    function handleSelectuf(event:ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        
        setSelectedUf(uf)
    }
    function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
        const citye = event.target.value
        
       setSelectedCity(citye)
    }

    //Click no map 
    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target

        setFormeData({...formData, [name]:value})

    }

    function handleSelectIntem(id:number){

        const alreadySelected = selectedItems.findIndex(item =>item === id)

        if(alreadySelected >= 0) {
           const filteresItems = selectedItems.filter(item => item !== id) 
           setSelectedItems(filteresItems)
        }else{
            setSelectedItems([...selectedItems,id])
        }
    
    }

    async function handleSubmit(event:FormEvent) {
        event.preventDefault()
        const {name, email, whatsapp} = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        
         await api.post('points', data)
         alert('Ponto de coleta cadastrado com sucesso!')
         history.push('/')
         
    }


    //Load citys 
    useEffect(() => {
        if(selectedUf === '0'){
            return
        }
        
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
            const cityName = response.data.map(city => city.nome)

          setCities(cityName)
        })
    },[selectedUf])

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Sistema de Coleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                Voltar para home 
                </Link>
            </header>
           <form onSubmit = {handleSubmit}>
               <h1>Cadastro do ponto de coleta</h1>

               <fieldset>
                   <legend>
                       <h2>Dados</h2>
                   </legend>
               </fieldset>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name"
                            onChange = {handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                                <label htmlFor="name">E-mail</label>
                                <input type="text" id="email" name="email" onChange = {handleInputChange}/>
                            </div>
                            <div className="field">
                                <label htmlFor="name">Whatsapp</label>
                                <input type="text" id="whatsapp" name="whatsapp" onChange = {handleInputChange}/>
                            </div>
                    </div>    
                        
               <fieldset>
                   <legend>
                       <h2>Endereços</h2>
                       <span>Selecione o endereço no mapa </span>
                </legend>
                    <Map center ={initialPosition}zoom = {15} onClick = {handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition}/>
                    </Map>

                   <div className="field-group">
                        <div className="field">
                           <label htmlFor="number">Número</label>
                           <input type="text" name="number" id="number"/>
                       </div>
                       <div className="field">
                           <label htmlFor="uf">Estado (UF)</label>
                           <select name="uf" id="uf" value = {selectedUf} onChange= {handleSelectuf}>
                               <option value="0">Selecione uma UF</option>
                               {ufs.map(uf => (
                                   <option key={uf} value={uf}> {uf} </option>
                               ))}
                           </select>
                       </div>
                   </div>
                   <div className="field">
                           <label htmlFor="city" >Cidade</label>
                           <select name="city" id="city"  value = {selectedCity} onChange= {handleSelectCity}>
                               <option value="0">Selecione uma cidade</option>
                               {cities.map(city => (
                                   <option key={city} value={city}> {city} </option>
                                   
                               ))} 
                           </select>
                       </div>
               </fieldset>

               <fieldset>
                   <legend>
                       <h2>Ítens de coleta</h2>
                       <span>Selecione um ou mais itens abaixo</span>
                   </legend>
                   <ul className='items-grid'>
                       
                           {items.map(item =>(
                           <li key={item.id} onClick = {() => handleSelectIntem(item.id)}
                                className = {selectedItems.includes(item.id)?'selected':''}

                           >
                               
                               <img src={item.image_url} alt={item.title}/>
                               <span>{item.title}</span>
                           </li>))}
                       
                       
                       
                   </ul>
               </fieldset>
               <button type="submit">Cadastrar ponto de coleta</button>
           </form>
        </div>
    )
    
}

export default CreatePoint