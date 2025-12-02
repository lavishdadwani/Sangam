import React from 'react'
import { ClockLoader } from 'react-spinners';

const ButtonSquare = (props) => {
    const {
        styleType = "default",
        loading = false,
        loadingMessage,
        disabled,
        className = "",
        children,
        ...restProps
    } = props;

    // Define style variants
    const styleVariants = {
        default: 'bg-[#ff4d2d] text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer',
        error: 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        outline: 'border-2 border-[#ff4d2d] text-[#ff4d2d] bg-transparent hover:bg-[#ff4d2d] hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    };

    // Base styles that apply to all buttons
    const baseStyles = 'flex flex-row items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Get variant styles
    const variantStyles = styleVariants[styleType] || styleVariants.default;
    
    // Combine all styles
    const combinedClassName = `${baseStyles} ${variantStyles} ${className}`.trim();

    // Determine loader color based on style type
    const getLoaderColor = () => {
        if (styleType === 'outline' || styleType === 'ghost') {
            return styleType === 'outline' ? '#ff4d2d' : '#374151';
        }
        return '#fff'; // White for all other variants
    };

    // If disabled, render disabled button
    if (disabled) {
        return (
            <button 
                {...restProps} 
                disabled 
                className={combinedClassName}
            >
                {children}
            </button>
        );
    }

    // If loading, show loading state
    if (loading) {
        return (
            <div className={`${combinedClassName} cursor-not-allowed`}>
                <ClockLoader color={getLoaderColor()} size={16} className="mr-2" />
                <span>{loadingMessage || "Processing, please wait."}</span>
            </div>
        );
    }

    // Normal button state
    return (
        <button 
            type={restProps.type || 'button'}
            {...restProps} 
            className={combinedClassName}
        >
            {children}
        </button>
    );
}

export default ButtonSquare

// #usage
// <ButtonSquare styleType="default" loading={isLoading}>Submit</ButtonSquare>
// <ButtonSquare styleType="error">Delete</ButtonSquare>
// <ButtonSquare styleType="outline">Cancel</ButtonSquare>