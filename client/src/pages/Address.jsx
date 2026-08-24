import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AddAddress from '../components/AddAddress'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import EditAddressDetails from '../components/EditAddressDetails';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';

const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList || [])
  const [openAddress,setOpenAddress] = useState(false)
  const [OpenEdit,setOpenEdit] = useState(false)
  const [editData,setEditData] = useState({})
  const { fetchAddress} = useGlobalContext()

  const handleDisableAddress = async(id)=>{
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data : {
          _id : id
        }
      })
      if(response.data.success){
        toast.success("Address Removed")
        if(fetchAddress){
          fetchAddress()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <div className='p-4 max-w-4xl mx-auto'>
        {/* Top Header Card */}
        <div className='bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex justify-between gap-4 items-center mb-4'>
            <h2 className='font-bold text-lg text-neutral-800 text-ellipsis line-clamp-1'>Saved Addresses</h2>
            <button 
              onClick={()=>setOpenAddress(true)} 
              className='border border-primary-200 text-primary-200 px-4 py-1.5 text-sm font-semibold hover:bg-primary-200 hover:text-neutral-900 rounded-full transition-all cursor-pointer shadow-sm shadow-primary-200/10'
            >
                Add Address
            </button>
        </div>

        {/* Address Container Grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-2'>
              {
                addressList.map((address,index)=>{
                  // Skip rendering if address status is falsy
                  if(!address.status) return null;

                  return(
                      <div key={address.id || index} className='border border-neutral-200 rounded-xl p-4 flex justify-between gap-4 bg-white hover:shadow-md transition-all duration-200 group relative'>
                          {/* Address Details Meta */}
                          <div className='text-sm text-neutral-600 space-y-1 pr-6'>
                            <p className='font-bold text-neutral-800 text-base mb-1 capitalize flex items-center gap-2'>
                              Address #{index + 1}
                            </p>
                            <p className='leading-relaxed'>{address.address_line}</p>
                            <p className='font-medium text-neutral-700'>{address.city}, {address.state}</p>
                            <p className='text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded inline-block font-mono mt-1'>
                              {address.country} - {address.pincode}
                            </p>
                            <p className='text-neutral-700 font-medium pt-1.5 border-t border-neutral-50 flex items-center gap-1.5'>
                              <span className='text-xs text-neutral-400 font-normal'>Phone:</span> {address.mobile}
                            </p>
                          </div>

                          {/* Action Buttons Toolbar */}
                          <div className='flex flex-col justify-between items-end gap-4 shrink-0'>
                            <button 
                              onClick={()=>{
                                setOpenEdit(true)
                                setEditData(address)
                              }} 
                              className='p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-100/50'
                              title="Edit Address"
                            >
                              <MdEdit size={16}/>
                            </button>
                            <button 
                              onClick={()=> handleDisableAddress(address.id) } 
                              className='p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-100/50'
                              title="Delete Address"
                            >
                              <MdDelete size={16}/>  
                            </button>
                          </div>
                      </div>
                  )
                })
              }

              {/* Dashed Empty Trigger Area Box */}
              <div 
                onClick={()=>setOpenAddress(true)} 
                className='h-full min-h-[160px] bg-neutral-50/50 hover:bg-neutral-50 border-2 border-dashed border-neutral-300 hover:border-primary-200 flex flex-col justify-center items-center gap-1.5 rounded-xl cursor-pointer transition-all p-4 group select-none'
              >
                <span className='text-2xl text-neutral-400 group-hover:text-primary-200 transition-colors font-light'>+</span>
                <span className='text-sm font-semibold text-neutral-500 group-hover:text-primary-200 transition-colors'>Add New Address</span>
              </div>
        </div>

        {/* Add Address Modal Component Overlay */}
        {
          openAddress && (
            <AddAddress close={()=>setOpenAddress(false)}/>
          )
        }

        {/* Edit Address Modal Component Overlay */}
        {
          OpenEdit && (
            <EditAddressDetails data={editData} close={()=>setOpenEdit(false)}/>
          )
        }
    </div>
  )
}

export default Address