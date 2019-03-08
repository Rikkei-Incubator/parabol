import {useContext} from 'react'
import {AtmosphereContext} from 'universal/components/AtmosphereProvider/AtmosphereProvider'
import Atmosphere from '../Atmosphere'

const useAtmosphere = () => {
  return useContext(AtmosphereContext) as Atmosphere
}

export default useAtmosphere
