import React, { useState,useEffect } from 'react';
function Link({handleScroll,children,anchor,isButton,addClass}) {
    return (
    <a 
        href={anchor} 
        onClick={handleScroll} 
        className={`${addClass ? addClass + ' ' : ''}${
            isButton
              ? 'text-base px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200'
              : 'text-base text-gray-600 hover:text-indigo-600 transition-colors duration-200 dark:text-white'
          }`}
        >
            {children}
    </a>)
}
export default Link;