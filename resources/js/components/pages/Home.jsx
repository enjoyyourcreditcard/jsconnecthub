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
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Card className="min-h-96">
                    <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }}>
                        <StepperPanel header="Pick Your Realm">
                            <div className="flex flex-column h-12rem">
                                <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center align-items-center font-medium">
                                    Realm
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
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Pick Your Class">
                            <div className="flex flex-column h-12rem">
                                <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center align-items-center font-medium">
                                    Class
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
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Pick Your Character">
                            <div className="flex flex-column h-12rem">
                                <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center align-items-center font-medium">
                                    Character
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
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Your Status">
                            <div className="flex flex-column h-12rem">
                                <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-center align-items-center font-medium">
                                    Status
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
