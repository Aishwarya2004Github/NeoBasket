import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";

const DeliveryPartners = () => {

  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // delete popup states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);



  // LOAD PARTNERS
  const loadPartners = async () => {

    try {

      setLoading(true);

      const response = await Axios({
        ...SummaryApi.deliveryPartners,
      });


      if(response.data.success){

        setPartners(response.data.data);

      }


    } catch(error){

      console.log(
        "LOAD ERROR:",
        error.response?.data || error
      );

      toast.error("Failed to load delivery partners");


    } finally {

      setLoading(false);

    }

  };





  // DELETE PARTNER
  const deletePartner = async()=>{


    try{


      const response = await Axios({

        url:
        `${SummaryApi.deleteDeliveryPartner.url}/${selectedPartnerId}`,

        method:"DELETE"

      });



      if(response.data.success){


        toast.success(
          response.data.message ||
          "Delivery Partner Deleted"
        );


        loadPartners();


      }
      else{


        toast.error(
          response.data.message ||
          "Delete failed"
        );


      }



    }catch(error){


      console.log(
        "DELETE ERROR:",
        error.response?.data || error
      );


      toast.error(
        error.response?.data?.message ||
        "Delete failed"
      );


    }
    finally{


      setShowDeleteModal(false);
      setSelectedPartnerId(null);


    }



  };





  useEffect(()=>{

    loadPartners();

  },[]);






  if(loading){

    return(

      <div className="min-h-[60vh] flex justify-center items-center">

        <p className="font-semibold text-slate-600">
          Loading Delivery Partners...
        </p>

      </div>

    );

  }






return (

<div className="p-6 max-w-7xl mx-auto">


{/* HEADER */}

<div className="bg-white p-6 rounded-2xl border mb-6 shadow-sm">


<h1 className="text-2xl font-bold">

Delivery Partners

</h1>


<p className="text-sm text-slate-500 mt-1">

Manage delivery employees

</p>


</div>





{
partners.length===0 ?


<div className="bg-white p-10 rounded-xl border text-center">


<h2 className="font-bold">

No Delivery Partner Found

</h2>


</div>


:


<div className="bg-white rounded-2xl border shadow-sm overflow-hidden">


<div className="overflow-x-auto">


<table className="w-full text-sm">


<thead className="bg-slate-100">


<tr>


<th className="p-4">
Photo
</th>


<th className="p-4">
Emp ID
</th>


<th className="p-4">
Name
</th>


<th className="p-4">
Mobile
</th>


<th className="p-4">
Email
</th>


<th className="p-4">
Orders
</th>


<th className="p-4">
Action
</th>


</tr>


</thead>





<tbody>


{

partners.map((partner)=>{


const partnerId =
partner._id || partner.id;



return(


<tr
key={partnerId}
className="border-b hover:bg-slate-50"
>


<td className="p-4">


<img

src={
partner.photo
?
`http://localhost:8080${partner.photo}`
:
"/no-avatar.png"
}

className="w-12 h-12 rounded-full object-cover"

/>


</td>





<td className="p-4 font-bold text-orange-600">

#{partner.employeeId}

</td>





<td className="p-4 font-semibold">

{partner.name}

</td>





<td className="p-4">

{partner.mobile}

</td>





<td className="p-4">

{partner.email}

</td>





<td className="p-4 text-center">

{partner._count?.orders || 0}

</td>





<td className="p-4">


<div className="flex gap-2">


<button

onClick={()=>navigate(
`/dashboard/delivery-partner/${partnerId}`
)}

className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs"

>

View

</button>






<button

onClick={()=>{

setSelectedPartnerId(partnerId);
setShowDeleteModal(true);

}}

className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs"

>

Delete

</button>



</div>


</td>




</tr>


)


})


}


</tbody>



</table>


</div>


</div>


}







{/* DELETE CONFIRM MODAL */}

{

showDeleteModal &&


<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">


<div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">


<h2 className="text-lg font-bold text-slate-900">

Delete Delivery Partner?

</h2>



<p className="text-sm text-slate-500 mt-2">

Are you sure you want to delete this delivery partner?

</p>





<div className="flex justify-end gap-3 mt-6">



<button

onClick={()=>{

setShowDeleteModal(false);
setSelectedPartnerId(null);

}}

className="px-4 py-2 border rounded-lg text-sm font-semibold"

>

Cancel

</button>





<button

onClick={deletePartner}

className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"

>

Delete

</button>



</div>



</div>


</div>


}



</div>


);


};


export default DeliveryPartners;

/*import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";

const DeliveryPartners = () => {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);


  // LOAD DELIVERY PARTNERS
  const loadPartners = async () => {
    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.deliveryPartners,
      });


      if (response.data.success) {
        setPartners(response.data.data);
      }

    } catch (error) {

      console.log(
        "LOAD PARTNER ERROR:",
        error.response?.data || error
      );

      toast.error("Failed to load delivery partners");

    } finally {
      setLoading(false);
    }
  };



  // DELETE DELIVERY PARTNER
const deletePartner = async (partnerId) => {

  if (!window.confirm("Are you sure you want to delete this delivery partner?")) {
    return;
  }


  try {


    const response = await Axios({

      url:`${SummaryApi.deleteDeliveryPartner.url}/${partnerId}`,

      method:"DELETE"

    });



    if(response.data.success){

      toast.success(
        response.data.message ||
        "Delivery Partner Deleted"
      );


      loadPartners();

    }
    else{

      toast.error(
        response.data.message ||
        "Delete failed"
      );

    }



  }catch(error){


    console.log(
      "DELETE ERROR:",
      error.response?.data || error
    );


    toast.error(
      error.response?.data?.message ||
      "Delete failed"
    );


  }

};




  useEffect(()=>{

    loadPartners();

  },[]);




  if(loading){

    return(

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-slate-600 font-semibold">
          Loading Delivery Partners...
        </div>

      </div>

    );

  }





  return (

    <div className="p-6 max-w-7xl mx-auto">


      <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Delivery Partners
        </h1>


        <p className="text-sm text-slate-500 mt-1">
          Manage all delivery employees
        </p>


      </div>





      {
        partners.length === 0 ?


        (

          <div className="bg-white border rounded-xl p-10 text-center">

            <h2 className="font-bold text-lg">
              No Delivery Partner Found
            </h2>

          </div>

        )


        :


        (

        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">


        <div className="overflow-x-auto">


        <table className="w-full text-sm">


        <thead className="bg-slate-100">

        <tr>

          <th className="p-4">
            Photo
          </th>

          <th className="p-4">
            Employee ID
          </th>

          <th className="p-4">
            Name
          </th>

          <th className="p-4">
            Mobile
          </th>

          <th className="p-4">
            Email
          </th>

          <th className="p-4">
            Orders
          </th>

          <th className="p-4">
            Action
          </th>


        </tr>

        </thead>





        <tbody>


        {
          partners.map((partner)=>{


            const partnerId =
              partner._id ||
              partner.id;



            const image = partner.photo
            ?
            partner.photo.startsWith("http")
            ?
            partner.photo
            :
            `http://localhost:8080${partner.photo}`
            :
            "/no-avatar.png";




            return (

              <tr
              key={partnerId}
              className="border-b hover:bg-slate-50"
              >



              <td className="p-4 text-center">


              <img

              src={image}

              alt="partner"

              className="w-12 h-12 rounded-full object-cover mx-auto"

              />


              </td>





              <td className="p-4 font-bold text-orange-600">

                #{partner.employeeId || "N/A"}

              </td>





              <td className="p-4 font-semibold">

                {partner.name}

              </td>





              <td className="p-4">

                {partner.mobile || "N/A"}

              </td>





              <td className="p-4">

                {partner.email || "N/A"}

              </td>





              <td className="p-4 text-center">


              {
                partner._count?.orders ??
                partner.orders?.length ??
                0
              }


              </td>





              <td className="p-4">


              <div className="flex gap-2 justify-center">



              <button

              onClick={()=>navigate(
                `/dashboard/delivery-partner/${partnerId}`
              )}

              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs"

              >

              View

              </button>






              <button

              onClick={()=>deletePartner(partnerId)}

              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs"

              >

              Delete

              </button>




              </div>


              </td>





              </tr>


            );


          })

        }


        </tbody>


        </table>


        </div>


        </div>


        )

      }



    </div>


  );

};


export default DeliveryPartners;

/*import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";


const DeliveryPartners = () => {


const navigate = useNavigate();


const [partners,setPartners] = useState([]);



const loadPartners = async()=>{

try{


const response = await Axios({

...SummaryApi.deliveryPartners

});



if(response.data.success){

setPartners(response.data.data);

}



}catch(error){

console.log(
"LOAD PARTNER ERROR",
error
);

}

};





const deletePartner = async(id)=>{


try{


const response = await Axios({

...SummaryApi.deleteDeliveryPartner,

data:{
id
}

});



if(response.data.success){

toast.success(
"Delivery Partner Deleted"
);


loadPartners();


}



}catch(error){


console.log(
"DELETE ERROR",
error
);


toast.error(
error.response?.data?.message ||
"Delete failed"
);


}



};






useEffect(()=>{

loadPartners();

},[]);






return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">

All Delivery Partners

</h1>





{
partners.length===0 ?


<p className="text-gray-500">

No Delivery Partner Found

</p>



:


<div className="overflow-x-auto">


<table className="w-full border">


<thead className="bg-orange-500 text-white">


<tr>


<th className="p-3">
Photo
</th>


<th className="p-3">
Employee ID
</th>


<th className="p-3">
Name
</th>


<th className="p-3">
Mobile
</th>


<th className="p-3">
Email
</th>


<th className="p-3">
Orders
</th>


<th className="p-3">
Action
</th>


</tr>


</thead>





<tbody>


{

partners.map((partner)=>(


<tr
key={partner.id}
className="border-b text-center"
>



<td className="p-3">


<img

src={
partner.photo
?
`http://localhost:8080${partner.photo}`
:
"https://via.placeholder.com/60"
}

className="w-14 h-14 rounded-full mx-auto object-cover"

/>


</td>





<td>

{partner.employeeId}

</td>





<td>

{partner.name}

</td>





<td>

{partner.mobile}

</td>





<td>

{partner.email}

</td>





<td>

{
partner._count?.orders || 0
}

</td>





<td className="space-x-2">


<button


onClick={()=>navigate(

`/dashboard/delivery-partner/${partner.id}`

)}


className="bg-blue-600 text-white px-4 py-2 rounded"

>

View

</button>





<button


onClick={()=>deletePartner(partner.id)}


className="bg-red-600 text-white px-4 py-2 rounded"

>

Delete

</button>



</td>





</tr>



))

}



</tbody>


</table>


</div>


}



</div>

);


};



export default DeliveryPartners;*/