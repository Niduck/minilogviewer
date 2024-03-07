import {useEffect} from 'react';
import sprite from '@/assets/icons/sprite.svg?raw';

export default function Icons() {
    useEffect(() => {
        const element = document.getElementById('icons-svg-sprite');
        if (element) {
            element.innerHTML = sprite;
        }
    });
    return <div id="icons-svg-sprite"></div>;
}
