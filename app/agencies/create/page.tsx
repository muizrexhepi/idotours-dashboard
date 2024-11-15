"use client"

// import AgenciesTable from '@/components/agencies/AgenciesTable'
// import AgencyForm from '@/components/forms/create-agency-form'
// import { useUser } from '@/context/user';
// import { API_URL } from '@/environment';
// import { Agency } from '@/models/agency';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react'



const Page = () => {
    // const [agencies, setAgencies] = useState<Agency[]>([]) 
    // const {user} = useUser()
  
    // const getAgencies = async () => {
    //   try {
    //     const res = await axios.get(
    //       `${API_URL}/agency/operator/${user?.$id}`
    //     );
    //     console.log({ bardh: res.data.data });
    //     setAgencies(res.data?.data);
        
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }
  
    // useEffect(() => {
    //   if(user) {
    //     getAgencies();
    //   }
    // }, [user])

    return (
        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-10">
            <h1>live</h1>
        {/* <h1 className="text-2xl font-bold mb-6">Agency management</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3">
            <AgencyForm />
          </div>
          <div className="w-full lg:w-2/3">
            <AgenciesTable agencies={agencies} />
          </div>
        </div> */}
      </div>
    )
}

export default Page;
