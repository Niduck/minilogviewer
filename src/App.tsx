import React from "react";

function App({children}:{children: React.ReactNode}) {
    return (
        <>
                <div className="flex flex-col w-full justify-center align-center">
                    <div className={"flex w-full h-full mx-auto flex-col justify-center items-center"}>
                        {children}
                    </div>
                </div>
        </>
    )
}

export default App
