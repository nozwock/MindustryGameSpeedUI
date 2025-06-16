let cols = [Pal.lancerLaser, Pal.accent, Color.valueOf("cc6eaf")]; //Pink from BetaMindy

function sliderTable(table) {
    let curSpeed = 0;

    table.table(Tex.buttonEdge3, (t) => {
        t.name = "tc-slidertable";
        let timeSlider = new Slider(-8, 8, 1, false);
        timeSlider.setValue(0);

        let timeButton = t
            .button("[accent]x1", () => {
                curSpeed++;
                if (curSpeed > 2) curSpeed = -2; // Cycling back
                curSpeed = Mathf.clamp(curSpeed, -2, 2);

                timeSlider.setValue(curSpeed);
            })
            .grow()
            .width(10.5 * 8)
            .get();
        timeButton.margin(0);
        let lStyle = timeButton.getStyle();
        lStyle.up = Tex.pane;
        lStyle.over = Tex.flatDownBase;
        lStyle.down = Tex.whitePane;

        let resetButton = t
            .button(new TextureRegionDrawable(Icon.refresh), 24, () => {
                timeSlider.setValue(0);
            })
            .padLeft(6)
            .get();
        resetButton.getStyle().imageUpColor = Pal.accent;

        t.add(timeSlider).padLeft(6).minWidth(200);
        timeSlider.moved((v) => {
            curSpeed = v;
            let speed = Math.pow(2, v);
            Time.setDeltaProvider(() =>
                Math.min(Core.graphics.getDeltaTime() * 60 * speed, 3 * speed),
            );

            Tmp.c1.lerp(cols, (timeSlider.getValue() + 8) / 16);

            timeButton.setText(speedText(v));
        });
    });
    table.visibility = () => visibility();
}

function speedText(speed) {
    Tmp.c1.lerp(cols, (speed + 8) / 16);
    let text = "[#" + Tmp.c1.toString() + "]";
    if (speed >= 0) {
        text += "x" + Math.pow(2, speed);
    } else {
        text += "x1/" + Math.pow(2, Math.abs(speed));
    }
    return text;
}

function visibility() {
    if (!Vars.ui.hudfrag.shown || Vars.ui.minimapfrag.shown()) return false;
    if (!Vars.mobile) return true;

    let input = Vars.control.input;
    return input.lastSchematic == null || input.selectPlans.isEmpty();
}

if (!Vars.headless) {
    Events.on(ClientLoadEvent, () => {
        let st = new Table();
        st.bottom().left();
        sliderTable(st);
        Vars.ui.hudGroup.addChild(st);

        if (Vars.mobile) {
            st.moveBy(0, Scl.scl(46));
        }
    });
}
