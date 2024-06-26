import React, { useContext, useEffect, useState } from 'react'
import { checkUserData } from '../../../utils/functions';
import { useSearchParams } from 'react-router-dom';
import { axiosReq } from '../../../utils/axios';
import { useNavigate } from 'react-router-dom';
import BuyerProfile from '../../../components/Profile';
import Listings from './Listings';
import { AppContext } from '../../../utils/context';
import Spinner from '../../../components/Spinner';
import Applications from './Applications';
import Notifications from './Notifications';
import SideNav from './SideNav';
import Navigation from './Navigation';
import MyDocuments from './MyDocuments';


function Page() {
    const { setListings, userData, setUserData, isLoading, setIsLoading, setApplications, applications, setIsLoggedIn, listings } = useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeNav, setActiveNav] = useState('home');
    const [filteredListings, setFilteredListings] = useState([]);
    const [prevFilteredListings, setPrevFilteredListings] = useState([]);
    const [carChecked, setCarChecked] = useState(false);
    const [motorcycleChecked, setMotorcycleChecked] = useState(false);


    const handleOnSearch = (e) => {
        setFilteredListings(listings.filter(listing => {
            try {
                let query = e.target.value.toLowerCase();
                if (carChecked && motorcycleChecked) {

                    return (
                        (query == '' ||
                            listing.modelandname.toLowerCase().includes(query)
                        )
                    );
                }
                if (carChecked) {
                    return (
                        (query == "" ||
                            listing.modelandname.toLowerCase().includes(query) &&
                            listing.vehicletype == "Car"
                        )
                    )
                }

                if (motorcycleChecked) {
                    return (
                        (query == "" ||
                            listing.modelandname.toLowerCase().includes(query) &&
                            listing.vehicletype == "Motorcycle"
                        )
                    )
                }

                return (
                    (query == '' ||
                        listing.modelandname.toLowerCase().includes(query)
                    )
                );
            } catch (error) {
                return null;
            }
        }))
    }

    const handleOnFilter = (e) => {
        const { name, checked } = e.target;
        let updatedListings = [...prevFilteredListings];

        switch (name) {
            case "car":
                if (checked) {
                    if (motorcycleChecked) {
                        updatedListings = listings;
                    } else {
                        if (checked) {
                            updatedListings = filteredListings.filter(f => f.vehicletype === "Car");
                        }
                    }
                } else {
                    if (motorcycleChecked)
                        updatedListings = filteredListings.filter(f => f.vehicletype === "Motorcycle");
                }
                setCarChecked(checked);
                break;
            case "motorcycle":
                if (checked) {
                    if (carChecked) {
                        updatedListings = listings;
                    } else {
                        if (checked) {
                            updatedListings = filteredListings.filter(f => f.vehicletype === "Motorcycle");
                        }
                    }
                } else {
                    if (carChecked)
                        updatedListings = filteredListings.filter(f => f.vehicletype === "Car");
                }
                setMotorcycleChecked(checked);
                break;
            default:
                break;
        }

        setPrevFilteredListings(filteredListings);
        setFilteredListings(updatedListings);
    }
    useEffect(() => {
        const fetchData = async () => {
            const response = await axiosReq.get("/dealership/listings");
            setListings(response.data.data.listings);
            setFilteredListings(response.data.data.listings);
        };
        fetchData();
        checkUserData(searchParams, setSearchParams, setUserData, setIsLoggedIn)
        if (userData && userData.isapproved) {
            if (applications.length == 0) {
                setApplications(userData.applications);
            }
        }
    }, []);


    return (
        <>
            {isLoading && <Spinner />}

            <Navigation activeNav={activeNav} setActiveNav={setActiveNav} />
            {activeNav == "home" && (
                <SideNav handleOnSearch={handleOnSearch} handleOnFilter={handleOnFilter} />
            )}


            <div className='mt-20 '>
                {activeNav == 'home' && (
                    <div className='ml-[30vh]'>
                        <Listings filteredListings={filteredListings} />
                    </div>
                )}

                {activeNav == 'applications' && (
                    <Applications />
                )}

                {activeNav == 'myDocuments' && (
                    <MyDocuments />
                )}

                {activeNav == 'notifications' && (
                    <Notifications />
                )}

                {activeNav == 'profile' && (
                    <BuyerProfile />
                )}
            </div>
        </>
    )
}

export default Page