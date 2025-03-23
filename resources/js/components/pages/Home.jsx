    import React, { useRef } from "react";
    import { Stepper } from "primereact/stepper";
    import { StepperPanel } from "primereact/stepperpanel";
    import { Button } from "primereact/button";
    import { Card } from "primereact/card";
    import Header from "../shared/layout/Header";

    function Home() {
        const stepperRef = useRef(null);
        return (
            <div>
                <Header />
                <div className="min-h-screen flex justify-center items-center px-4">
                    <Card className="w-11/12 sm:w-11/12 md:w-10/12 xl:w-1/2">
                        <Stepper ref={stepperRef} className="w-full">
                            <StepperPanel header="Realm">
                                <div className="flex flex-col h-32">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex-grow flex justify-center items-center text-sm sm:text-base md:text-lg">
                                        Pick Your Realm
                                    </div>
                                </div>
                                <div className="flex pt-4 justify-end">
                                    <Button
                                        label="Next"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() =>
                                            stepperRef.current.nextCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Class">
                                <div className="flex flex-col h-32">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex-grow flex justify-center items-center text-sm sm:text-base md:text-lg">
                                        Pick Your Class
                                    </div>
                                </div>
                                <div className="flex pt-4 justify-between">
                                    <Button
                                        label="Back"
                                        severity="secondary"
                                        icon="pi pi-arrow-left"
                                        onClick={() =>
                                            stepperRef.current.prevCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                    <Button
                                        label="Next"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() =>
                                            stepperRef.current.nextCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Character">
                                <div className="flex flex-col h-32">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex-grow flex justify-center items-center text-sm sm:text-base md:text-lg">
                                        Pick Your Character
                                    </div>
                                </div>
                                <div className="flex pt-4 justify-between">
                                    <Button
                                        label="Back"
                                        severity="secondary"
                                        icon="pi pi-arrow-left"
                                        onClick={() =>
                                            stepperRef.current.prevCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                    <Button
                                        label="Next"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() =>
                                            stepperRef.current.nextCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Status">
                                <div className="flex flex-col h-32">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex-grow flex justify-center items-center text-sm sm:text-base md:text-lg">
                                        Your Status
                                    </div>
                                </div>
                                <div className="flex pt-4 justify-start">
                                    <Button
                                        label="Back"
                                        severity="secondary"
                                        icon="pi pi-arrow-left"
                                        onClick={() =>
                                            stepperRef.current.prevCallback()
                                        }
                                        className="text-sm sm:text-base p-2"
                                    />
                                </div>
                            </StepperPanel>
                        </Stepper>
                    </Card>
                </div>
            </div>
        );
    }

    export default Home;
