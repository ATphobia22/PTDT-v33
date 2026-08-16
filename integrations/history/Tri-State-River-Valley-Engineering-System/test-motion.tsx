import React, { useEffect } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'motion/react';
import { renderToString } from 'react-dom/server';

function Test() {
  const mv = useMotionValue(0);
  const tf = useTransform(mv, v => v.toFixed(2));
  return <motion.span>{tf}</motion.span>;
}

console.log(renderToString(<Test />));
