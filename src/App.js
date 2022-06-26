import { useState, useEffect } from "react";
import logo from "./logo_bw.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Section from "./Section";
import LoadJSONForm from "./LoadJSONForm";
import moment from "moment";
import domtoimage from "dom-to-image";

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [todayDate, setTodayDate] = useState(null);

  useEffect(() => {
    if (jsonData) {
      if (dataType === "pendingRequests") {
        processPengingRequests(jsonData);
      } else {
        processUsersList(jsonData);
      }
    }
  }, [jsonData, todayDate]);

  const [topClickers, setTopClickers] = useState(null);
  const [topEarners, setTopEarners] = useState(null);
  const [topBalance, setTopBalance] = useState(null);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  const processUsersList = (jsonData) => {
    // Найти топовых кликеров
    let usersList = [];
    let sumBalance = 0;
    let sumClicks = 0;
    for (const userID in jsonData) {
      const user = jsonData[userID];
      if (userID === "clearfix" || user.banReason) continue;
      if (user.lastReset === +todayDate) {
        const sameUserIndex = -1;
        // const sameUserIndex = usersList.findIndex((u) => u.name === user.name);
        if (sameUserIndex >= 0) {
          usersList[sameUserIndex].bonusBalance += user.bonusBalance;
          usersList[sameUserIndex].earnedToday += user.earnedToday;
          usersList[sameUserIndex].clickedToday += user.clickedToday;
        } else {
          usersList.push(user);
        }
        // usersList.push(user);
      }
      // usersList.push(user);
      sumBalance += user.bonusBalance;
      sumClicks += user.clickedToday;
    }

    // Всего кликов
    setTotalClicks(sumClicks);

    // Личный и суммарный баланс
    setTopBalance(
      usersList.sort((a, b) => b.bonusBalance - a.bonusBalance).slice(0, 25)
    );
    setTotalBalance(sumBalance);

    // Всего пользователей
    setTotalUsersCount(usersList.length);

    // Лучшие кликеры
    setTopClickers(
      usersList.sort((a, b) => b.clickedToday - a.clickedToday).slice(0, 25)
    );

    // Больше всех заработали
    setTopEarners(
      usersList.sort((a, b) => b.earnedToday - a.earnedToday).slice(0, 25)
    );
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("D MMMM, H:MM ");
  };

  const convertBonusesToRub = (bonuses) => {
    return Math.floor(bonuses / 100) / 10;
  };

  const getRequestType = (req) => {
    const qiwi = /[q|g|k]i[v|w]i|киви/gim;
    const sber = /сбер\S*|sber\S*/gim;
    const BANLIST = [
      // ну тут все понятно
      "юрик попов",
      "крутой ник",
      "ghyyr mbmnv",
      "pro100yrik",
      "grodno lida",
      "misha volkov",
      "polak anjey",
      "stop xam",
      "andrey petrovish",
      "kris kogan",
      "791529286207",
      "375295949336",
      "994505354479",
      // TealKekS-Игровой канал. дубликат заявок, и возможно накрутка рекламы
      "TealKekS-Игровой канал",
      "79212380392",
      "79115126935",
      // судя по всему это любимый (@Love282L) из тг
      "89515023253",
      "Наталья Петровская",
      // баланс обновлялся ровно раз в 12 секунд
      "Олег Иванов",
      "79966292440",
    ];

    const isBanned = BANLIST.find(
      (item) =>
        req.comment.toLowerCase().includes(item.toLowerCase()) ||
        req.user.toLowerCase().includes(item.toLowerCase())
    );

    if (isBanned) {
      return "banned";
    }

    if (req.comment.match(qiwi)) {
      return "qiwi";
    } else if (req.comment.match(sber)) {
      return "sber";
    } else {
      return "other";
    }
  };

  const [requestsList, setRequestsList] = useState();
  const [requestsTotal, setRequestsTotal] = useState();
  const [requestsCount, setRequestsCount] = useState();

  const processPengingRequests = (jsonData) => {
    let reqList = [];
    let sberTotal, qiwiTotal, otherTotal, total;
    let requestsCounter = 0;
    sberTotal = qiwiTotal = otherTotal = total = 0;

    for (const reqID in jsonData) {
      if (reqID === "clearfix") continue;
      const req = jsonData[reqID];
      const reqType = getRequestType(req);
      reqList.push(req);

      total += convertBonusesToRub(req.bonusesSpent);
      requestsCounter++;
      if (reqType === "qiwi") {
        qiwiTotal += convertBonusesToRub(req.bonusesSpent);
      } else if (reqType === "sber") {
        sberTotal += convertBonusesToRub(req.bonusesSpent);
      } else {
        otherTotal += convertBonusesToRub(req.bonusesSpent);
      }
    }
    setRequestsCount(requestsCounter);
    setRequestsList(reqList);
    setRequestsTotal({ sberTotal, qiwiTotal, otherTotal, total });
  };

  return (
    <>
      <div id="animatedBackground" />
      <div className="App App-container">
        {/* <img src={logo} className="header-logo" alt="emoji-clicker" /> */}
        <p className="header-text">emoji clicker dashboard</p>

        <LoadJSONForm setJsonData={setJsonData} setDataType={setDataType} />
        <input
          className="todayInput"
          placeholder="сегодняшняя дата"
          type="text"
          onChange={(e) => setTodayDate(e.target.value)}
        ></input>

        <div className="sections-container">
          <Section headerText={`всего пользователей: ${totalUsersCount}`}>
            <p>{`суммарно у них на счету: ${totalBalance} бонусов (${Math.round(
              totalBalance / 1000
            )}р)`}</p>
            <p>Всего кликов сегодня: {totalClicks}</p>
          </Section>

          {topBalance && (
            <Section headerText="самые богатые">
              <ol>
                {topBalance.map((user) => (
                  <li>
                    {user.name} — {user.bonusBalance} (
                    {Math.round(user.bonusBalance / 1000)}р)
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {topEarners && (
            <Section headerText={`Больше всех заработали`}>
              <ol>
                {topEarners.map((user) => (
                  <li>
                    {user.name} — {user.earnedToday} (
                    {Math.round(user.earnedToday / 1000)}р)
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {topClickers && (
            <Section headerText={`лучшие кликеры`}>
              <ol>
                {topClickers.map((user, i) => (
                  <li className={i < 3 ? "brstold" : ""}>
                    {user.name} — {user.clickedToday}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {requestsList && (
            <Section headerText={`выплаты`}>
              <p>
                всего заявок: {requestsCount}
                <br />
                <br />
                qiwi: {requestsTotal.qiwiTotal.toPrecision(4)}р <br />
                сбер: {requestsTotal.sberTotal.toPrecision(4)}р<br />
                другое: {requestsTotal.otherTotal.toPrecision(4)}р<br />
                <strong>итого: {requestsTotal.total.toPrecision(4)}р</strong>
              </p>
              {requestsList.map((req, i) => (
                <div
                  className={"request " + `request--${getRequestType(req)}`}
                  id={"req" + i}
                >
                  <div className="request__header">
                    <div>
                      <div
                        className="request__user"
                        onClick={() => {
                          domtoimage
                            .toBlob(document.getElementById("req" + i))
                            .then((blob) => {
                              navigator.clipboard.write([
                                new window.ClipboardItem({ "image/png": blob }),
                              ]);
                            });
                        }}
                      >
                        {req.user}
                      </div>
                      <div
                        className="request__comment"
                        onClick={() => {
                          const number = req.comment.match(/\d+/)[0];
                          navigator.clipboard.writeText(number);
                        }}
                      >
                        {req.comment}
                      </div>
                    </div>
                    <div className="request__sum">
                      {convertBonusesToRub(req.bonusesSpent)}р
                    </div>
                  </div>

                  <div className="request__footer">
                    <span className="request__date">
                      {formatDate(req.requestDate)}
                    </span>
                    {/* <span className="request__version"> v.{req.version}</span> */}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
