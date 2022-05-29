// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const PieChart = props => {
//   const ref = useRef(null);
//   const cache = useRef(props.data);
//   const createPie = d3
//     .pie()
//     .value(d => d.size)
//     .sort(null);
//   const createArc = d3
//     .arc()
//     .innerRadius(props.innerRadius)
//     .outerRadius(props.outerRadius);
//   const colors = d3.scaleOrdinal(d3.schemeCategory10);
//   const format = d3.format(".2f");
  
//   useEffect(
//     () => {
//       const data = createPie(props.data);
//       const prevData = createPie(cache.current);
//       const group = d3.select(ref.current);
//       const groupWithData = group.selectAll("g.arc").data(data);

//       const tooltip = d3.select("body").append("div")
//       .attr("class", "tooltip")
//       .style("opacity", 1e-6);

//       groupWithData.exit().remove();

//       const groupWithUpdate = groupWithData
//         .enter()
//         .append("g")
//         .attr("class", "arc");

//       const path = groupWithUpdate
//         .append("path")
//         .merge(groupWithData.select("path.arc"));

//       const arcTween = (d, i) => {
//         const interpolator = d3.interpolate(prevData[i], d);

//         return t => createArc(interpolator(t));
//       };

//       const onClickNodes = (d, i) => {
//         const newData = i.data.children;
//         if (newData !== undefined)
//           props.onClickChange(i.data.children);
//       }

//       const onClickMiddle = (d, i) => {
//         console.log("CLICK MIDDLE : ");
//         // props.onClickChange(prevData.map(val => val.data));
//       }

//       const onMouseMove = (d, i) => {
//         if(i.data.poster){
//           tooltip
//             .html("<img src='"+i.data.poster+"' style='height:215px;width:150px;'>")
//               .style("left", (d.pageX - 10) + "px")
//               .style("top", (d.pageY - 200) + "px");
//         }
//         if(i.data.scene){
//           tooltip
//             .html("<img src='"+i.data.scene+"' style='height:180px;width:460px;'>")
//               .style("left", (d.pageX - 10) + "px")
//               .style("top", (d.pageY - 200) + "px");
//         }
//       }

//       const onMouseOver = (d, i) => {
//         if (i.data.year){
//           tooltip
//             .transition()
//             .duration(500)
//             .style("opacity", 1);
//         }
//       }
      
//       const onMouseOut = (d, i) => {
//         if (i.data.year){
//           tooltip
//             .transition()
//             .duration(500)
//             .style("opacity", 1e-6);
//         }
//       }

//       path
//         .attr("class", "arc")
//         .attr("fill", (d, i) => d.data.color)
//         .on("click", onClickNodes)
//         .on("mousemove", onMouseMove)
//         .on("mouseover", onMouseOver)
//         .on("mouseout", onMouseOut)
//         .transition()
//         .attrTween("d", arcTween);

//       const text = groupWithUpdate
//         .append("text")
//         .merge(groupWithData.select("text"));

//       text
//         .attr("text-anchor", "middle")
//         .attr("alignment-baseline", "middle")
//         .style("fill", "white")
//         .style("font-size", 20)
//         .transition()
//         .attr("transform", d => `translate(${createArc.centroid(d)})`)
//         .tween("text", (d, i, nodes) => {
//           const interpolator = d3.interpolate(prevData[i], d);
          
//           //return t => d3.select(nodes[i]).text(format(interpolator(t).value));
//           return t => d3.select(nodes[i]).text(d.data.name);
//         });
      
//       d3.select('#middleButton')
//       .on("click", onClickMiddle);

//       cache.current = props.data;
//     },
//     [props.data]
//   );

//   return (
//     <div>
//       <svg width={props.width} height={props.height}>
//         <g
//           ref={ref}
//           transform={`translate(${props.outerRadius} ${props.outerRadius})`}
//         >
//           <circle id="middleButton" cx="0" cy="0" r={props.innerRadius} fill="grey" />
//         </g>
//       </svg>
//     </div>
//   );
// };

// export default PieChart;

// Check full tutorial: https://dev.to/andrewchmr/react-d3-sunburst-chart-3cpd

import React from "react";
import * as d3 from "d3";
import data from "./data.json";

// const SIZE = 975;
// const RADIUS = SIZE / 2;
const width = 960,
    height = 700,
    RADIUS = (Math.min(width, height) / 2) - 10;


const PieChart = () => {
  const svgRef = React.useRef(null);
  const [viewBox, setViewBox] = React.useState("0,0,0,0");

  const partition = (data) =>
    d3.partition().size([2 * Math.PI, RADIUS])(
      d3
        .hierarchy(data)
        .sum((d) => d.size)
        .sort((a, b) => b.size - a.size)
    );

  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  );

  const format = d3.format(",d");

  const x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

  const y = d3.scaleSqrt()
    .range([0, RADIUS]);

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(RADIUS / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  const getAutoBox = () => {
    if (!svgRef.current) {
      return "";
    }

    const { x, y, width, height } = svgRef.current.getBBox();

    return [x, y, width, height].toString();
  };

  React.useEffect(() => {
    setViewBox(getAutoBox());
  }, []);

  const getColor = (d) => {
    while (d.depth > 1) d = d.parent;
    return color(d.data.name);
  };

  const getTextTransform = (d) => {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = (d.y0 + d.y1) / 2;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  };

  const root = partition(data);

  const onClickZoom = (d) => {
    console.log("ASDASD : ", d)
    d3.select('#mainSVG')
      .transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, RADIUS]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
  }

  return (
    <svg id="mainSVG" width={width} height={height} viewBox={viewBox} ref={svgRef}>
      <g fillOpacity={0.6}>
        {root
          .descendants()
          .filter((d) => d.depth)
          .map((d, i) => (
            <path key={`${d.data.name}-${i}`} fill={getColor(d)} d={arc(d)} onClick={() => onClickZoom(d)}>
              <text>
                {d
                  .ancestors()
                  .map((d) => d.data.name)
                  .reverse()
                  .join("/")}
                \n${format(d.size)}
              </text>
            </path>
          ))}
      </g>
      <g
        pointerEvents="none"
        textAnchor="middle"
        fontSize={10}
        fontFamily="sans-serif"
      >
        {root
          .descendants()
          .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
          .map((d, i) => (
            <text
              key={`${d.data.name}-${i}`}
              transform={getTextTransform(d)}
              dy="0.35em"
            >
              {d.data.name}
            </text>
          ))}
      </g>
    </svg>
  );
};

export default PieChart;