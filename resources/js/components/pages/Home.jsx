import React, { useEffect } from "react";
import Table from "../shared/misc/Table";
import Header from "../shared/layout/Header";

function Home() {
    const handleEdit = (id) => console.log(`Edit ${id}`);
    const handleDelete = (id) => console.log(`Delete ${id}`);

    return (
        <div>
            <Header title="Home Page" />
            <Table
                type="app"
                endpoint="/api/sample"
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default Home;
