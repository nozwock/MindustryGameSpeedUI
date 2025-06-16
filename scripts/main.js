let pinkColor = [Pal.lancerLaser, Pal.accent, Color.valueOf("cc6eaf")]; //Pink from BetaMindy

function createTimeControlWidget(table) {
    let currentGameSpeed = 0;

    table.table(Tex.buttonEdge3, (table) => {
        table.name = "tc-slidertable";
        let timeSlider = new Slider(-8, 8, 1, false);
        timeSlider.setValue(0);

        let timeButton = table
            .button("[accent]x1", () => {
                currentGameSpeed++;
                if (currentGameSpeed > 2) currentGameSpeed = -2; // Cycling back
                currentGameSpeed = Mathf.clamp(currentGameSpeed, -2, 2);

                // log("Time button callback", curSpeed);
                timeSlider.setValue(currentGameSpeed);
            })
            .grow()
            .width(10.5 * 8)
            .get();
        timeButton.margin(0);
        {
            let style = timeButton.getStyle();
            style.up = Tex.pane;
            style.over = Tex.flatDownBase;
            style.down = Tex.whitePane;
        }

        let resetButton = table
            .button(new TextureRegionDrawable(Icon.refresh), 24, () => {
                // log("Reset button callback", 0);
                timeSlider.setValue(0);
            })
            .padLeft(6)
            .get();
        resetButton.getStyle().imageUpColor = Pal.accent;

        table.add(timeSlider).padLeft(6).minWidth(200);
        timeSlider.moved((v) => {
            // log("Slider callback", v);
            currentGameSpeed = v;
            setGameSpeed(v);

            Tmp.c1.lerp(pinkColor, (timeSlider.getValue() + 8) / 16);
            timeButton.setText(toSpeedText(v));
        });
    });
    table.visibility = () => getGUIVisibility();
}

// FIXME: Seems like setting game speed breaks logic for many subsystems? This
// pretty much seems to make the whole mod useless.
// https://github.com/sk7725/TimeControl/issues/39
function setGameSpeed(speed) {
    let speed = Math.pow(2, speed);
    Time.setDeltaProvider(() =>
        Math.min(Core.graphics.getDeltaTime() * 60 * speed, 3 * speed),
    );
}

function toSpeedText(speed) {
    Tmp.c1.lerp(pinkColor, (speed + 8) / 16);
    let text = "[#" + Tmp.c1.toString() + "]";
    if (speed >= 0) {
        text += "x" + Math.pow(2, speed);
    } else {
        text += "x1/" + Math.pow(2, Math.abs(speed));
    }
    return text;
}

// FIXME: Currently, the game speed doesn't get reset if the user exits out of
// a map to the main menu or planet menu. And, with there being no way to reset
// it from the UI since the widget is not visible there.
function getGUIVisibility() {
    if (!Vars.ui.hudfrag.shown || Vars.ui.minimapfrag.shown()) return false;
    if (!Vars.mobile) return true;

    let input = Vars.control.input;
    return input.lastSchematic == null || input.selectPlans.isEmpty();
}

// Register mod
if (!Vars.headless) {
    Events.on(ClientLoadEvent, () => {
        let timeControlTable = new Table();
        timeControlTable.bottom().left();
        createTimeControlWidget(timeControlTable);
        Vars.ui.hudGroup.addChild(timeControlTable);

        if (Vars.mobile) {
            timeControlTable.moveBy(0, Scl.scl(46));
        }
    });
}
