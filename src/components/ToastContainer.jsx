import React, { useState, useRef, useEffect } from "react";

function Toast({message}) {
	return (
		<output className="px-4 py-3 bg-slate-700 text-white w-72 rounded-lg toast mb-4">
			{message}
		</output>
	)
}

function ToastContainer({ toasts = [], setToasts }) {


	// Remove toast with timer
	useEffect(()=>{
		const timer =setTimeout(() => {
			setToasts(toasts => toasts.slice(1));
		}, 3000);
		return () => clearTimeout(timer);
	}, [toasts]);

	

	return (
		<section className="absolute bottom-0 right-0 left-0 z-20 flex flex-col-reverse justify-center items-center mb-10">
			{toasts.map((t, i) => <Toast key={i} message={t}/>)}
		</section>
	);
};

export default ToastContainer