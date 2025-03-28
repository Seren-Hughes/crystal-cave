## Development Troubleshooting

During the development of my layout, I initially encountered some issues with positioning the bat sprite and the level number on different screen sizes. While the media queries were functional, the positioning was not optimal and felt inefficient.

### Issue:
- The bat sprite was too close to the crystal container on smaller screens and required many adjustments.
- The level number was positioned awkwardly on smaller screens, requiring too many adjustments.

### Fixes:
- I reviewed and optimized the media queries, reducing redundancy and focusing on the key breakpoints.
- I implemented a responsive wrapper for the bat and level number, so they scale and adjust automatically based on the available screen space.

Here’s a screenshot of the DevTools Flexbox grid showing the updated layout/wrapper adjustments:

![DevTools Screenshot](assets/media/game-div-wrapper-for-level-number.png)