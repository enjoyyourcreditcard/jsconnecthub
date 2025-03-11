import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRecords } from '../store/globalSlice';
import Header from "../shared/layout/Header";
import Button from "../shared/misc/Button";

function Home() {
    const dispatch = useDispatch();
    const { data, spinner } = useSelector((state) => state.global.app);

    useEffect(() => {
        dispatch(getRecords({
          type: 'app',
          endPoint: '/api/sample', // Laravel API route
          key: 'data',
        }));
      }, [dispatch]);

    useEffect(() => {
        dispatch(
            getRecords({
                type: "app",
                endPoint: "/api/sample", // Laravel API route
                key: "data",
            })
        );
    }, [dispatch]);
    return (
        <div>
            <Header title="Home Page" />
            <Button label="Test" onClick={() => console.log("Clicked!")} />
            {spinner.show && <p>{spinner.text}</p>}
            <p>Data: {JSON.stringify(data)}</p>
        </div>
    );
}

export default Home;
