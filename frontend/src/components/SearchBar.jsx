import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import { useLocation } from 'react-router-dom'
import { expandSearchQuery } from '../api/ai'
import useDebounce from '../hooks/useDebounce'

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext)
    const [visible, setVisible] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const debouncedSearch = useDebounce(search, 400)
    const location = useLocation()

    useEffect(() => {
        setVisible(location.pathname.includes('collection'))
    }, [location])

    useEffect(() => {
        const loadSuggestions = async () => {
            if (!showSearch || debouncedSearch.trim().length < 3) {
                setSuggestions([])
                return
            }

            try {
                const terms = await expandSearchQuery(debouncedSearch.trim().toLowerCase())
                setSuggestions([...new Set(terms)].slice(0, 6))
            } catch {
                setSuggestions([])
            }
        }

        loadSuggestions()
    }, [debouncedSearch, showSearch])

    if (!(showSearch && visible)) return null

    return (
        <div className='border-t border-b border-line bg-paper text-center'>
            <div className='inline-flex items-center justify-center border border-line px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='flex-1 outline-none bg-transparent text-sm'
                    type='text'
                    placeholder='Search products, vendors, locations...'
                />
                <img className='w-4' src={assets.search_icon} alt='' />
            </div>

            {suggestions.length > 0 && (
                <div className='mx-auto mb-4 flex flex-wrap justify-center gap-2 px-3'>
                    {suggestions.map((term) => (
                        <button
                            key={term}
                            onClick={() => setSearch(term)}
                            className='rounded-full border border-line px-3 py-1 text-xs hover:bg-ink hover:text-paper transition-colors'
                        >
                            {term}
                        </button>
                    ))}
                </div>
            )}

            <img
                onClick={() => setShowSearch(false)}
                className='inline w-3 cursor-pointer'
                src={assets.cross_icon}
                alt=''
            />
        </div>
    )
}

export default SearchBar