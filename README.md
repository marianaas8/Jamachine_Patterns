# Jamachine - Interactive Music Creation  
**Generative Music & Gesture Interaction**

Jamachine is an interactive system that combines machine learning, computer vision, and music creation. Using simple written inputs, the system generates dynamic musical compositions. Users can select a genre, mix instrument samples, and compose music by writing letters and numbers, all while receiving real-time feedback on their musical creations.

![Lógica do Jogo SDI](https://github.com/user-attachments/assets/bbe9665c-4f2c-47f6-91e0-7330508192ac)

---

## How to Use

1. **Download and Setup**:  
   - Download the project files and open the `index.html` file in your browser, or run the project using the [p5.js Web Editor](https://editor.p5js.org/).

2. **Enable Webcam**:  
   - Ensure that your webcam is enabled and positioned to face a white, writable surface.

3. **Interacting with the System**:  
   - On the white surface, write the characters (letters and numbers) in the designated areas (the squares).  
   - In the top section of the screen, write 'p' for pop, 'h' for hip-hop, or 'r' for rock to select the genre.
   - In the middle section, write '1', '2', or '3' to choose between different musical samples for bass, drums, lead, and vocals.
   - The system will immediately generate a musical composition based on your selections.

4. **Explore the Music**:  
   - Experiment with different combinations of genres and samples to create your own unique musical compositions.
   - As you make selections, the music will automatically adjust, creating a dynamic, real-time composition.

---

## Viewing the Code

- The project’s code can be found in the `sketch.js` file.  
- You can modify and run the project directly in the [p5.js Web Editor](https://editor.p5js.org/).

---

## Technologies Used

- **p5.js**: Utilized for creating and rendering the interactive visual interface.
- **ml5.js**: Used for processing video input and recognizing user-written symbols with machine learning.
- **Teachable Machine**: Integrated for classifying genres and musical samples based on visual inputs.
- **p5.sound**: Employed for generating and synchronizing the sound of the musical samples.

---

## Notes

- Ensure you have good lighting and a steady camera position for optimal input detection.
- No musical experience is required to enjoy and create with Jamachine.
- The system interprets written symbols via webcam input, so handwriting clarity may affect accuracy.
